from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from main import (
    get_db, get_current_user, get_password_hash, get_user_by_username,
    get_user_by_email, get_user_by_id, User, UserCreate, UserResponse, UserUpdate
)
from datetime import datetime

router = APIRouter()

# CREATE - Регистрация нового пользователя
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    print(f"🔍 Получен запрос на регистрацию: {user_data.username}, {user_data.email}")
    
    # Проверяем, существует ли пользователь с таким username или email
    existing_user_by_username = get_user_by_username(db, user_data.username)
    if existing_user_by_username:
        print(f"Пользователь с username {user_data.username} уже существует")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    existing_user_by_email = get_user_by_email(db, user_data.email)
    if existing_user_by_email:
        print(f"Пользователь с email {user_data.email} уже существует")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        # Создаем нового пользователя с профильными полями
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            profile_visibility="public",
            show_email=False,
            show_phone=False,
            show_birth_date=False,
            profile_updated_at=datetime.utcnow()
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        print(f"Пользователь {user_data.username} успешно создан с ID: {db_user.id}")
        return db_user
        
    except Exception as e:
        print(f"Ошибка при создании пользователя: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

# READ - Получить всех пользователей (только для аутентифицированных пользователей)
@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

# READ - Получить пользователя по ID
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

# UPDATE - Обновить данные пользователя
@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print(f"Запрос на обновление пользователя {user_id} от пользователя {current_user.id}")
    
    # Проверяем, что пользователь может обновлять только свои данные
    if current_user.id != user_id:
        print(f"Недостаточно прав: пользователь {current_user.id} пытается изменить данные пользователя {user_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = get_user_by_id(db, user_id)
    if not user:
        print(f"Пользователь с ID {user_id} не найден")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    try:
        # Обновляем поля, если они предоставлены
        update_data = user_update.dict(exclude_unset=True)
        print(f"Данные для обновления: {update_data}")
        
        if "email" in update_data:
            # Проверяем, не занят ли новый email
            existing_user = get_user_by_email(db, update_data["email"])
            if existing_user and existing_user.id != user_id:
                print(f"Email {update_data['email']} уже занят")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            user.email = update_data["email"]
            print(f"Email обновлен на: {update_data['email']}")
        
        if "username" in update_data:
            # Проверяем, не занят ли новый username
            existing_user = get_user_by_username(db, update_data["username"])
            if existing_user and existing_user.id != user_id:
                print(f"Username {update_data['username']} уже занят")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already registered"
                )
            user.username = update_data["username"]
            print(f"Username обновлен на: {update_data['username']}")
        
        if "password" in update_data:
            user.hashed_password = get_password_hash(update_data["password"])
            print("Пароль обновлен")
        
        user.profile_updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(user)
        
        print(f"Пользователь {user_id} успешно обновлен")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Ошибка при обновлении пользователя: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )

# DELETE - Удалить пользователя
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Проверяем, что пользователь может удалять только свой аккаунт
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Деактивируем все refresh токены пользователя
    from main import RefreshToken
    db.query(RefreshToken).filter(RefreshToken.user_id == user_id).update(
        {"is_active": False}
    )
    
    db.delete(user)
    db.commit()
    
    return None
