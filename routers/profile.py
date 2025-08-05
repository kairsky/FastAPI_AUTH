from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from main import (
    get_db, get_current_user, get_user_by_id, filter_user_profile,
    User, UserProfileUpdate, UserPrivacySettings, UserResponse, UserPublicProfile
)
import os
import uuid
from pathlib import Path

router = APIRouter()

# Конфигурация для загрузки файлов
UPLOAD_DIR = Path("uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить свой полный профиль"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновить свой профиль"""
    
    # Обновляем поля профиля
    update_data = profile_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)
    
    # Обновляем время изменения профиля
    current_user.profile_updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.put("/me/privacy", response_model=UserResponse)
async def update_privacy_settings(
    privacy_data: UserPrivacySettings,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновить настройки приватности"""
    
    update_data = privacy_data.dict(exclude_unset=True)
    
    # Валидация значений
    if "profile_visibility" in update_data:
        if update_data["profile_visibility"] not in ["public", "private", "friends"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid profile visibility value"
            )
    
    for field, value in update_data.items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)
    
    current_user.profile_updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Загрузить аватар пользователя"""
    
    # Проверяем размер файла
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 5MB"
        )
    
    # Проверяем расширение файла
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed: jpg, jpeg, png, gif, webp"
        )
    
    # Генерируем уникальное имя файла
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    # Сохраняем файл
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save file"
        )
    
    # Удаляем старый аватар если есть
    if current_user.avatar_url:
        old_file_path = Path(current_user.avatar_url.replace("/uploads/", "uploads/"))
        if old_file_path.exists():
            old_file_path.unlink()
    
    # Обновляем URL аватара в базе данных
    current_user.avatar_url = f"/uploads/avatars/{filename}"
    current_user.profile_updated_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Avatar uploaded successfully",
        "avatar_url": current_user.avatar_url
    }

@router.delete("/me/avatar")
async def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удалить аватар пользователя"""
    
    if not current_user.avatar_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No avatar found"
        )
    
    # Удаляем файл
    file_path = Path(current_user.avatar_url.replace("/uploads/", "uploads/"))
    if file_path.exists():
        file_path.unlink()
    
    # Обновляем базу данных
    current_user.avatar_url = None
    current_user.profile_updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Avatar deleted successfully"}

@router.get("/{user_id}", response_model=UserPublicProfile)
async def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Получить публичный профиль пользователя"""
    
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return filter_user_profile(user, current_user)

@router.get("/username/{username}", response_model=UserPublicProfile)
async def get_user_profile_by_username(
    username: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Получить публичный профиль пользователя по username"""
    
    from main import get_user_by_username
    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return filter_user_profile(user, current_user)

@router.get("/", response_model=List[UserPublicProfile])
async def search_users(
    q: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Поиск пользователей"""
    
    query = db.query(User).filter(User.is_active == True)
    
    if q:
        search_term = f"%{q}%"
        query = query.filter(
            (User.username.ilike(search_term)) |
            (User.first_name.ilike(search_term)) |
            (User.last_name.ilike(search_term)) |
            (User.company.ilike(search_term))
        )
    
    # Показываем только публичные профили в поиске
    query = query.filter(User.profile_visibility == "public")
    
    users = query.offset(skip).limit(limit).all()
    
    return [filter_user_profile(user, current_user) for user in users]

@router.get("/stats/me")
async def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить статистику своего профиля"""
    
    # Подсчитываем различные метрики
    profile_completeness = 0
    total_fields = 10
    
    fields_to_check = [
        'first_name', 'last_name', 'phone', 'birth_date', 
        'bio', 'location', 'website', 'company', 'job_title', 'avatar_url'
    ]
    
    for field in fields_to_check:
        if getattr(current_user, field):
            profile_completeness += 1
    
    completeness_percentage = (profile_completeness / total_fields) * 100
    
    # Время с момента регистрации
    days_since_registration = (datetime.utcnow() - current_user.created_at).days
    
    # Время с последнего обновления профиля
    days_since_update = (datetime.utcnow() - current_user.profile_updated_at).days
    
    return {
        "profile_completeness": {
            "percentage": round(completeness_percentage, 1),
            "completed_fields": profile_completeness,
            "total_fields": total_fields
        },
        "account_age_days": days_since_registration,
        "days_since_last_update": days_since_update,
        "last_login": current_user.last_login,
        "profile_visibility": current_user.profile_visibility,
        "privacy_settings": {
            "show_email": current_user.show_email,
            "show_phone": current_user.show_phone,
            "show_birth_date": current_user.show_birth_date
        }
    }
