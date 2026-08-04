function renderAuth(mode) {
    const isLogin = mode === 'login';
    
    return `
        <div class="auth-section">
            <div class="auth-layout">
                <div class="auth-image">${isLogin ? '🔑' : '🏡'}</div>
                <div class="form-container">
                    <h2 class="form-title">${isLogin ? 'Вход в кабинет' : 'Регистрация'}</h2>
                    <p class="form-subtitle">${isLogin ? 'Войдите в личный кабинет по email и паролю' : 'Создайте аккаунт для бронирования'}</p>
                    
                    <form onsubmit="handleAuthSubmit(event, '${mode}')">
                        ${!isLogin ? `
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Имя</label>
                                    <input type="text" name="first_name" required placeholder="Иван">
                                </div>
                                <div class="form-group">
                                    <label>Фамилия</label>
                                    <input type="text" name="last_name" required placeholder="Иванов">
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" required placeholder="you@example.com">
                        </div>
                        
                        ${!isLogin ? `
                            <div class="form-group">
                                <label>Телефон</label>
                                <input type="tel" name="phone_number" placeholder="+7 (999) 000-00-00">
                            </div>
                        ` : ''}
                        
                        <div class="form-group">
                            <label>Пароль</label>
                            <input type="password" name="password" required minlength="6" placeholder="••••••">
                        </div>
                        
                        <button type="submit" class="btn btn-block">
                            ${isLogin ? 'Войти в кабинет' : 'Зарегистрироваться'}
                        </button>
                    </form>
                    
                    <div class="auth-toggle">
                        ${isLogin 
                            ? 'Нет аккаунта? <a href="#/register">Зарегистрироваться</a>' 
                            : 'Уже есть аккаунт? <a href="#/login">Войти</a>'}
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function handleAuthSubmit(e, mode) {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));
    
    try {
        const result = mode === 'login' 
            ? await authLogin(data) 
            : await authRegister(data);
        
        setStorage('user', result.user);
        alert('✅ ' + result.message);
        navigate('/cabinet');
        window.location.reload();
    } catch (err) {
        alert('❌ ' + err.message);
    }
}