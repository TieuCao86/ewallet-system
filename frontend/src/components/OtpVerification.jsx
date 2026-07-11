import { Warning } from "@phosphor-icons/react";
import FormInput from "./FormInput.jsx";

export default function OtpVerification({
                                            phone,
                                            amount,
                                            receiver,

                                            action,

                                            otp,
                                            setOtp,

                                            loading,
                                            countdown,

                                            onSubmit,
                                            onResend,
                                            onCancel,

                                            error,

                                            confirmText = "Xác nhận"
                                        }) {

    return (
        <form onSubmit={onSubmit}>

            <p
                style={{
                    color: "var(--muted)",
                    fontSize: "0.88rem",
                    margin: "0 0 20px",
                    lineHeight: 1.5
                }}
            >
                Để đảm bảo an toàn cho tài khoản ví, vui lòng nhập mã OTP được gửi
                qua SMS tới số điện thoại{" "}
                <strong>{phone}</strong>{" "}
                để hoàn tất{" "}
                <strong>{action}</strong>{" "}

                {amount && (
                    <>
                        <strong>{amount}đ</strong>
                    </>
                )}

                {receiver && (
                    <>
                        {" "}
                        tới <strong>{receiver}</strong>
                    </>
                )}
                .
            </p>

            {error && (
                <div
                    className="error-message"
                    style={{
                        fontSize: "0.9rem",
                        marginBottom: "16px"
                    }}
                >
                    <Warning size={16} /> {error}
                </div>
            )}

            <div
                style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-end",
                    marginBottom: "16px"
                }}
            >

                <div style={{ flex: 1 }}>
                    <FormInput
                        label="Mã xác thực OTP (6 chữ số)"
                        id="otp"
                        type="password"
                        placeholder="Nhập mã OTP"
                        value={otp}
                        onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        inputStyle={{
                            textAlign: "center",
                            letterSpacing: "8px",
                            fontSize: "1.2rem"
                        }}
                        maxLength={6}
                        required
                        disabled={loading}
                        style={{
                            marginBottom: 0
                        }}
                    />
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={onResend}
                    disabled={countdown > 0 || loading}
                    style={{
                        height: "48px",
                        minWidth: "120px",
                        borderRadius: "14px",
                        padding: "0 16px",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    {countdown > 0
                        ? `Gửi lại (${countdown}s)`
                        : "Gửi mã"}
                </button>

            </div>

            <div
                style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "24px"
                }}
            >

                <button
                    type="button"
                    className="secondary-button"
                    style={{
                        flex: 1,
                        minHeight: "46px"
                    }}
                    onClick={onCancel}
                    disabled={loading}
                >
                    Hủy bỏ
                </button>

                <button
                    type="submit"
                    className="auth-btn"
                    style={{
                        flex: 1,
                        minHeight: "46px"
                    }}
                    disabled={loading}
                >
                    {loading
                        ? <div className="btn-spinner" />
                        : confirmText}
                </button>

            </div>

        </form>
    );
}