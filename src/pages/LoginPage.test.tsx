import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LoginPage } from './LoginPage';
import { useAuth } from '../context/AuthContext';
import { BrowserRouter, useNavigate } from 'react-router-dom';

// 1. Mock useAuth context
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

// 2. Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom') as any;
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

describe('LoginPage', () => {
    const mockNavigate = vi.fn();
    const mockLogin = vi.fn();
    const mockClearAuthExpiredMessage = vi.fn();

    const renderWithRouter = (ui: React.ReactElement) => {
        return render(<BrowserRouter>{ui}</BrowserRouter>);
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // 預設的回傳值
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
        vi.mocked(useAuth).mockReturnValue({
            login: mockLogin,
            logout: vi.fn(),
            user: null,
            isAuthenticated: false,
            isLoading: false,
            authExpiredMessage: null,
            clearAuthExpiredMessage: mockClearAuthExpiredMessage,
            token: null,
            checkAuth: vi.fn()
        });

        // 重置 VITE_API_URL 環境變數
        vi.stubEnv('VITE_API_URL', '');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    describe('前端元素', () => {
        it('顯示完整的登入表單 UI', () => {
            renderWithRouter(<LoginPage />);

            expect(screen.getByText('歡迎回來')).toBeInTheDocument();
            expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
            expect(screen.getByLabelText('密碼')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
            expect(screen.getByText('測試帳號cdscdscsdcds：任意 email 格式 / 密碼需包含英數且8位以上')).toBeInTheDocument();
        });
    });

    describe('function 邏輯', () => {
        it('驗證 Email 格式 - 輸入無效格式', async () => {
            renderWithRouter(<LoginPage />);
            const user = userEvent.setup();

            const emailInput = screen.getByLabelText('電子郵件');
            const submitBtn = screen.getByRole('button', { name: '登入' });

            await user.type(emailInput, 'invalid-email');
            await user.click(submitBtn);

            expect(screen.getByText('請輸入有效的 Email 格式')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('驗證 Email 格式 - 輸入有效格式則錯誤消失', async () => {
            renderWithRouter(<LoginPage />);
            const user = userEvent.setup();

            const emailInput = screen.getByLabelText('電子郵件');
            const submitBtn = screen.getByRole('button', { name: '登入' });

            await user.type(emailInput, 'invalid-email');
            await user.click(submitBtn);
            expect(screen.getByText('請輸入有效的 Email 格式')).toBeInTheDocument();

            // 輸入正確並改變內容，再次提交（或 onchange 會改變狀態但錯誤只有 submit 觸發更新，
            // LoginPage 的驗證是在 handleSubmit 內觸發的...等等，其實是 submit 觸發？）
            // 上方原始碼只有在 submit 檢查 email 格式
            // But if user clicks submit again... Wait, looking at LoginPage.tsx:
            // "className={emailError ? 'error' : ''}" but email validation is inside handleSubmit.
            // When submit is clicked again with correct valid format, error should be cleared.
            await user.clear(emailInput);
            await user.type(emailInput, 'valid@example.com');
            const passwordInput = screen.getByLabelText('密碼');
            await user.type(passwordInput, 'validPass1'); // 輸入正確的密碼以順利清除全部錯誤並呼叫 login
            await user.click(submitBtn);

            await waitFor(() => {
                expect(screen.queryByText('請輸入有效的 Email 格式')).not.toBeInTheDocument();
            });
        });

        it('驗證密碼格式 - 長度不足', async () => {
            renderWithRouter(<LoginPage />);
            const user = userEvent.setup();

            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitBtn = screen.getByRole('button', { name: '登入' });

            await user.type(emailInput, 'valid@example.com');
            await user.type(passwordInput, 'short1');
            await user.click(submitBtn);

            expect(screen.getByText('密碼必須至少 8 個字元')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('驗證密碼格式 - 缺少英文或數字', async () => {
            renderWithRouter(<LoginPage />);
            const user = userEvent.setup();

            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitBtn = screen.getByRole('button', { name: '登入' });

            await user.type(emailInput, 'valid@example.com');
            await user.type(passwordInput, '12345678');
            await user.click(submitBtn);

            expect(screen.getByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();

            await user.clear(passwordInput);
            await user.type(passwordInput, 'abcdefgh');
            await user.click(submitBtn);
            expect(screen.getByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
        });

        it('驗證密碼格式 - 正確格式則錯誤消失', async () => {
            renderWithRouter(<LoginPage />);
            const user = userEvent.setup();

            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitBtn = screen.getByRole('button', { name: '登入' });

            await user.type(emailInput, 'valid@example.com');
            await user.type(passwordInput, 'short1');
            await user.click(submitBtn);
            expect(screen.getByText('密碼必須至少 8 個字元')).toBeInTheDocument();

            await user.clear(passwordInput);
            await user.type(passwordInput, 'Valid123');
            await user.click(submitBtn);

            await waitFor(() => {
                expect(screen.queryByText('密碼必須至少 8 個字元')).not.toBeInTheDocument();
                expect(mockLogin).toHaveBeenCalled();
            });
        });

        it('登入請求中顯示 Loading 狀態', async () => {
            // Mock a pending promise resolving later
            let resolveLogin: any;
            mockLogin.mockImplementation(() => new Promise((res) => {
                resolveLogin = res;
            }));

            renderWithRouter(<LoginPage />);
            const user = userEvent.setup();

            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitBtn = screen.getByRole('button', { name: '登入' });

            await user.type(emailInput, 'valid@example.com');
            await user.type(passwordInput, 'Valid123');
            await user.click(submitBtn);

            expect(submitBtn).toHaveTextContent('登入中...');
            expect(submitBtn).toBeDisabled();
            expect(emailInput).toBeDisabled();
            expect(passwordInput).toBeDisabled();

            resolveLogin(); // clear pending promise

            await waitFor(() => {
                expect(submitBtn).not.toHaveTextContent('登入中...');
            });
        });
    });

    describe('Mock API', () => {
        it('Mock API 登入成功導向儀表板', async () => {
            mockLogin.mockResolvedValueOnce(undefined);
            renderWithRouter(<LoginPage />);
            const user = userEvent.setup();

            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitBtn = screen.getByRole('button', { name: '登入' });

            await user.type(emailInput, 'valid@example.com');
            await user.type(passwordInput, 'Valid123');
            await user.click(submitBtn);

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith('valid@example.com', 'Valid123');
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
            });
        });

        it('Mock API 登入失敗顯示錯誤訊息', async () => {
            const mockError = {
                isAxiosError: true,
                response: { data: { message: '自訂錯誤訊息' } }
            };
            mockLogin.mockRejectedValueOnce(mockError);

            renderWithRouter(<LoginPage />);
            const user = userEvent.setup();

            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitBtn = screen.getByRole('button', { name: '登入' });

            await user.type(emailInput, 'valid@example.com');
            await user.type(passwordInput, 'Valid123');
            await user.click(submitBtn);

            await waitFor(() => {
                expect(screen.getByText('自訂錯誤訊息')).toBeInTheDocument();
            });
        });
    });

    describe('Context 狀態', () => {
        it('已登入狀態直接導向 dashboard', () => {
            vi.mocked(useAuth).mockReturnValue({
                login: mockLogin,
                logout: vi.fn(),
                user: null,
                isAuthenticated: true, // 已登入
                isLoading: false,
                authExpiredMessage: null,
                clearAuthExpiredMessage: mockClearAuthExpiredMessage,
                token: 'mock-token',
                checkAuth: vi.fn()
            });

            renderWithRouter(<LoginPage />);

            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });

        it('檢查過期狀態並顯示對應錯誤', () => {
            vi.mocked(useAuth).mockReturnValue({
                login: mockLogin,
                logout: vi.fn(),
                user: null,
                isAuthenticated: false,
                isLoading: false,
                authExpiredMessage: '您的登入已過期', // 有過期訊息
                clearAuthExpiredMessage: mockClearAuthExpiredMessage,
                token: null,
                checkAuth: vi.fn()
            });

            renderWithRouter(<LoginPage />);

            expect(screen.getByText('您的登入已過期')).toBeInTheDocument();
            expect(mockClearAuthExpiredMessage).toHaveBeenCalled();
        });
    });
});
