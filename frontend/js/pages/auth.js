function renderAuth(mode) {
    const isLogin = mode === 'login';
    const refCode = !isLogin ? (getQueryParams().ref || '') : '';

    return `
        <div class="auth-section ${!isLogin ? 'auth-section--register' : ''}">
            <div class="auth-layout">
                <div class="auth-image ${isLogin ? 'has-illustration' : ''}">
                    ${isLogin ? '<img src="/static/assets/images/illustration-login.png" alt="">' : icon('cottage', 80)}
                </div>
                <div class="form-container">
                    <h2 class="form-title">${isLogin ? t('login_title') : t('register_title')}</h2>
                    <p class="form-subtitle">${isLogin ? t('login_subtitle') : t('register_subtitle')}</p>

                    ${refCode ? `<div class="alert alert-success" style="margin-bottom:16px;">${t('ref_notice')}</div>` : ''}
                    <form onsubmit="handleAuthSubmit(event, '${mode}')" autocomplete="off" novalidate>
                        ${refCode ? `<input type="hidden" name="ref_code" value="${refCode}">` : ''}
                        ${!isLogin ? `
                            <div class="form-row">
                                <div class="form-group">
                                    <label>${t('first_name_label')}</label>
                                    <input type="text" name="first_name" required placeholder="${t('placeholder_first_name')}" autocomplete="off">
                                </div>
                                <div class="form-group">
                                    <label>${t('last_name_label')}</label>
                                    <input type="text" name="last_name" required placeholder="${t('placeholder_last_name')}" autocomplete="off">
                                </div>
                            </div>
                        ` : ''}

                        <div class="form-group">
                            <label>${t('email_label')}</label>
                            <input type="email" name="email" required placeholder="you@example.com" autocomplete="off">
                        </div>

                        ${!isLogin ? `
                            <div class="form-group">
                                <label>${t('phone_label')}</label>
                                <input type="tel" name="phone_number" placeholder="+7 (999) 000-00-00" autocomplete="off">
                            </div>
                        ` : ''}

                        <div class="form-group">
                            <label>${t('password_label')}</label>
                            <input type="password" name="password" required minlength="6" placeholder="••••••" autocomplete="new-password">
                        </div>

                        <button type="submit" class="btn btn-block">
                            ${isLogin ? t('login_submit') : t('register_submit')}
                        </button>
                    </form>

                    <div class="auth-toggle">
                        ${isLogin
                            ? `${t('no_account')} <a href="#/register">${t('register_submit')}</a>`
                            : `${t('has_account')} <a href="#/login">${t('login_short')}</a>`}
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function handleAuthSubmit(e, mode) {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) return;
    const data = Object.fromEntries(new FormData(form));

    try {
        const result = mode === 'login' 
            ? await authLogin(data) 
            : await authRegister(data);
        
        setStorage('user', result.user);
        toastSuccess(result.message);
        setTimeout(() => {
            navigate('/cabinet');
            window.location.reload();
        }, 700);
    } catch (err) {
        toastError(err.message);
    }
}