import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LoginPage } from '../LoginPage';
import { BrowserRouter } from 'react-router-dom';
import { AxiosError } from 'axios';

// Mock `import.meta.env` behavior if needed, but for now rely on default undefined in test
// If you needed to mock it, you might need a more complex setup or depend on how vitest configures env.

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock useAuth
const mockLogin = vi.fn();
const mockClearAuthExpiredMessage = vi.fn();
// We use a mutable mock object to allow tests to change return values
const mockAuthContext = {
    login: mockLogin,
    isAuthenticated: false,
    authExpiredMessage: '' as string | null,
    clearAuthExpiredMessage: mockClearAuthExpiredMessage,
};

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => mockAuthContext,
}));

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset mockAuthContext values to default
        mockAuthContext.login = mockLogin;
        mockAuthContext.isAuthenticated = false;
        mockAuthContext.authExpiredMessage = '';
        mockAuthContext.clearAuthExpiredMessage = mockClearAuthExpiredMessage;
    });

    const renderComponent = () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );
    };

    describe('前端元素', () => {
        it('檢查頁面基本元素渲染', () => {
            renderComponent();

            expect(screen.getByRole('heading', { name: '歡迎回來' })).toBeInTheDocument();
            expect(screen.getByLabelText('電子郵件')).toHaveAttribute('type', 'text');
            expect(screen.getByLabelText('電子郵件')).toHaveAttribute('id', 'email');
            expect(screen.getByLabelText('密碼')).toHaveAttribute('type', 'password');
            expect(screen.getByLabelText('密碼')).toHaveAttribute('id', 'password');
            expect(screen.getByRole('button', { name: '登入' })).toBeEnabled();
        });

        it('檢查測試環境提示', () => {
            // Assuming import.meta.env.VITE_API_URL is undefined in test environment
            renderComponent();
            expect(screen.getByText('測試帳號：任意 email 格式 / 密碼需包含英數且8位以上')).toBeInTheDocument();
        });
    });

    describe('表單驗證', () => {
        it('驗證 Email 格式錯誤', async () => {
            renderComponent();

            const emailInput = screen.getByLabelText('電子郵件');
            const submitButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.click(submitButton);

            expect(screen.getByText('請輸入有效的 Email 格式')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('驗證密碼長度不足', async () => {
            renderComponent();

            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(passwordInput, { target: { value: '12345' } });
            fireEvent.click(submitButton);

            expect(screen.getByText('密碼必須至少 8 個字元')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('驗證密碼複雜度不足', async () => {
            renderComponent();

            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            // Only numbers
            fireEvent.change(passwordInput, { target: { value: '12345678' } });
            fireEvent.click(submitButton);
            expect(screen.getByText('密碼必須包含英文字母.  etbtenrtn和數字')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();

            // Clear error
            fireEvent.change(passwordInput, { target: { value: '' } });

            // Only letters
            fireEvent.change(passwordInput, { target: { value: 'abcdefgh' } });
            fireEvent.click(submitButton);
            expect(screen.getByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });
    });

    describe('Function 邏輯', () => {
        it('成功登入流程', async () => {
            mockLogin.mockResolvedValue(undefined);
            renderComponent();

            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });

            fireEvent.click(submitButton);

            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(screen.getByText('登入中...')).toBeInTheDocument();
            expect(submitButton).toBeDisabled();

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
            });
        });

        it('已登入狀態自動導向', () => {
            mockAuthContext.isAuthenticated = true;
            renderComponent();
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });

        it('顯示與清除過期訊息', () => {
            mockAuthContext.authExpiredMessage = 'Session expired';
            renderComponent();

            expect(screen.getByText('Session expired')).toBeInTheDocument();
            expect(mockClearAuthExpiredMessage).toHaveBeenCalled();
        });
    });

    describe('Mock API', () => {
        it('處理登入失敗', async () => {
            const errorMessage = 'Invalid credentials';
            const error = new AxiosError(errorMessage);
            error.response = {
                data: { message: errorMessage },
                status: 401,
                statusText: 'Unauthorized',
                headers: {},
                config: {} as any
            };
            mockLogin.mockRejectedValue(error);

            renderComponent();

            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });

            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(errorMessage)).toBeInTheDocument();
            });

            expect(screen.getByRole('button', { name: '登入' })).toBeEnabled();
            expect(screen.queryByText('登入中...')).not.toBeInTheDocument();
        });
    });
});
