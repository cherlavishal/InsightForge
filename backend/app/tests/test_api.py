import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import json
import os

from app.main import app
from app.database import Base, get_db
from app.models.database_models import User
from app.utils.security import hash_password

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# Test data
TEST_USER = {
    "email": "test@example.com",
    "full_name": "Test User",
    "password": "TestPass123!"
}

@pytest.fixture(scope="module")
def setup_database():
    """Set up test database"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("test.db"):
        os.remove("test.db")

@pytest.fixture
def test_user(setup_database):
    """Create a test user"""
    db = TestingSessionLocal()
    
    # Check if user already exists
    user = db.query(User).filter(User.email == TEST_USER["email"]).first()
    if not user:
        user = User(
            email=TEST_USER["email"],
            full_name=TEST_USER["full_name"],
            hashed_password=hash_password(TEST_USER["password"])
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    db.close()
    return user

class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_register_user(self, setup_database):
        """Test user registration"""
        response = client.post("/api/v1/auth/register", json={
            "email": "newuser@example.com",
            "full_name": "New User",
            "password": "NewPass123!"
        })
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["full_name"] == "New User"
        assert "id" in data
    
    def test_register_existing_user(self, test_user):
        """Test registering with existing email"""
        response = client.post("/api/v1/auth/register", json={
            "email": TEST_USER["email"],
            "full_name": "Another User",
            "password": "AnotherPass123!"
        })
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]
    
    def test_login_success(self, test_user):
        """Test successful login"""
        response = client.post("/api/v1/auth/login", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = client.post("/api/v1/auth/login", json={
            "email": "wrong@example.com",
            "password": "WrongPass123!"
        })
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_get_current_user(self, test_user):
        """Test getting current user info"""
        # First login to get token
        login_response = client.post("/api/v1/auth/login", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        })
        token = login_response.json()["access_token"]
        
        # Get current user
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_USER["email"]
        assert data["full_name"] == TEST_USER["full_name"]

class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "insightforge-backend"

class TestDataEndpoints:
    """Test data management endpoints"""
    
    def test_upload_dataset_no_auth(self):
        """Test uploading dataset without authentication"""
        response = client.post("/api/v1/data/upload")
        
        assert response.status_code == 401
    
    def test_list_datasets_no_auth(self):
        """Test listing datasets without authentication"""
        response = client.get("/api/v1/data/datasets")
        
        assert response.status_code == 401

class TestAnalyticsEndpoints:
    """Test analytics endpoints"""
    
    def test_descriptive_analysis_no_auth(self):
        """Test descriptive analysis without authentication"""
        response = client.post("/api/v1/analytics/descriptive", json={
            "dataset_id": 1,
            "columns": ["col1", "col2"]
        })
        
        assert response.status_code == 401

class TestInsightsEndpoints:
    """Test insights endpoints"""
    
    def test_generate_insights_no_auth(self):
        """Test generating insights without authentication"""
        response = client.post("/api/v1/insights/generate", json={
            "dataset_id": 1,
            "focus_areas": ["sales", "profit"]
        })
        
        assert response.status_code == 401

# Test utility functions
def test_hash_password():
    """Test password hashing"""
    from app.utils.security import hash_password, verify_password
    
    password = "TestPass123!"
    hashed = hash_password(password)
    
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("WrongPass", hashed)

def test_create_access_token():
    """Test JWT token creation"""
    from app.utils.security import create_access_token, verify_token
    
    data = {"user_id": 1, "email": "test@example.com"}
    token = create_access_token(data)
    
    decoded = verify_token(token)
    assert decoded is not None
    assert decoded["user_id"] == 1
    assert decoded["email"] == "test@example.com"

# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])