import React, { useState } from 'react'
import { signupStyles } from '../assets/dummyStyles'
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Mail, User, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE } from '../config';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Signup = ({ onSignupSuccess = null }) => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [adminCode, setAdminCode] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [loading, setLoading] = useState(false);

    //   validate email or password
    const validate = () => {
        const e = {};
        if (!name.trim()) e.name = "Name is required";
        if (!email) e.email = "Email is required";
        else if (!isValidEmail(email)) e.email = "Please enter a valid email";
        if (!password) e.password = "Password is required";
        else if (password.length < 6)
            e.password = "Password must be at least 6 characters";
        if (role === "admin" && !adminCode.trim()) e.adminCode = "Admin invite code is required";
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setSubmitError("");
        const v = validate();
        setErrors(v);
        if (Object.keys(v).length) return;

        setLoading(true);

        try {
            const payload = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                role,
                adminCode: role === "admin" ? adminCode.trim() : undefined,
            };

            const resp = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            let data = null;

            try {
                data = await resp.json();
            } catch {
                // Non-JSON error responses are surfaced through the status fallback below.
            }

            if (!resp.ok) {
                const msg = data?.message || "Register failed";
                setSubmitError(msg);
                return;
            }

            if (data?.token) {
                try {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem(
                        'currentUser',
                        JSON.stringify(data.user || {
                            name: name.trim(),
                            email: email.trim().toLowerCase(),
                        })
                    );
                } catch {
                    // Storage failures should not block account creation.
                }
            }

            const createdUser = data.user || {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                role,
            };
            window.dispatchEvent(new CustomEvent("authChanged", { detail: { user: createdUser } }));

            if (typeof onSignupSuccess === "function") {
                try {
                    onSignupSuccess(createdUser);
                } catch {
                    // Consumer callback is optional and must not block navigation.
                }

            }

            navigate(createdUser.role === "admin" ? "/admin" : "/student", { replace: true });
        } catch (err) {
            console.error("Signup error:", err);
            setSubmitError("Network Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={signupStyles.pageContainer}>
            <Link to="/login" className={signupStyles.backButton}>
                <ArrowLeft className={signupStyles.backButtonIcon} />
                <span className={signupStyles.backButtonText}>Back</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={signupStyles.formContainer}
            >
                <form onSubmit={handleSubmit}>
                    <div className={signupStyles.animatedBorder}>
                        <div className={signupStyles.formContent}>
                            <h2 className={signupStyles.heading}>
                                <span className={signupStyles.headingIcon}>
                                    <CheckCircle className={signupStyles.headingIconInner} />
                                </span>
                                <span className={signupStyles.headingText}>Create Account</span>
                            </h2>

                            <p className={signupStyles.subtitle}>
                                Create a student account, or use the private invitation code to create an admin account.
                            </p>

                            <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-slate-950/60 p-1">
                                {[
                                    ["student", "Student", User],
                                    ["admin", "Admin", ShieldCheck],
                                ].map(([value, label, Icon]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => {
                                            setRole(value);
                                            setErrors((current) => ({ ...current, adminCode: undefined }));
                                        }}
                                        className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition ${
                                            role === value
                                                ? "bg-cyan-300 text-slate-950"
                                                : "text-slate-300 hover:bg-white/10"
                                        }`}
                                    >
                                        <Icon size={16} />
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* lable for input Name of the user  */}
                            <label className={signupStyles.label}>
                                <span className={signupStyles.labelText}>Full Name</span>
                                <div className={signupStyles.inputContainer}>
                                    <span className={signupStyles.inputIcon}>
                                        <User className={signupStyles.inputIconInner} />
                                    </span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            if (errors.name)
                                                setErrors((s) => ({
                                                    ...s,
                                                    name: undefined,
                                                }));

                                        }}

                                        className={`${signupStyles.input} ${errors.name ? signupStyles.inputError : signupStyles.inputNormal
                                            }`}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                {errors.name && (
                                    <p className={signupStyles.errorText}>{errors.name}</p>
                                )}
                            </label>

                            {/* label for ente the email of the user  */}

                            <label className={signupStyles.label}>
                                <span className={signupStyles.labelText}>Email</span>
                                <div className={signupStyles.inputContainer}>
                                    <span className={signupStyles.inputIcon}>
                                        <Mail className={signupStyles.inputIconInner} />
                                    </span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email)
                                                setErrors((s) => ({
                                                    ...s,
                                                    email: undefined,
                                                }));

                                        }}

                                        className={`${signupStyles.input} ${errors.email
                                            ? signupStyles.inputError
                                            : signupStyles.inputNormal
                                            }`}
                                        placeholder="your@example.com"
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className={signupStyles.errorText}>{errors.email}</p>
                                )}
                            </label>

                            {/* lable use for input the user  password  */}
                            <label className={signupStyles.label}>
                                <span className={signupStyles.labelText}>Password</span>
                                <div className={signupStyles.inputContainer}>
                                    <span className={signupStyles.inputIcon}>
                                        <Lock className={signupStyles.inputIconInner} />
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password)
                                                setErrors((s) => ({
                                                    ...s,
                                                    password: undefined,
                                                }));

                                        }}

                                        className={`${signupStyles.input} ${signupStyles.passwordInput} ${errors.password
                                            ? signupStyles.inputError
                                            : signupStyles.inputNormal
                                            }`}
                                        placeholder="Create a password"
                                        required
                                    />

                                    {/* toggle btn  */}
                                    <button type='button' onClick={() => setShowPassword((s) => !s)}
                                        className={signupStyles.passwordToggle}
                                    >
                                        {showPassword ? (
                                            <EyeOff className={signupStyles.passwordToggleIcon} />
                                        ) : (
                                            <Eye className={signupStyles.passwordToggleIcon} />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className={signupStyles.errorText}>{errors.password}</p>
                                )}
                            </label>

                            {role === "admin" && (
                                <label className={signupStyles.label}>
                                    <span className={signupStyles.labelText}>Admin Invite Code</span>
                                    <div className={signupStyles.inputContainer}>
                                        <span className={signupStyles.inputIcon}>
                                            <ShieldCheck className={signupStyles.inputIconInner} />
                                        </span>
                                        <input
                                            type="password"
                                            value={adminCode}
                                            onChange={(e) => {
                                                setAdminCode(e.target.value);
                                                if (errors.adminCode)
                                                    setErrors((s) => ({
                                                        ...s,
                                                        adminCode: undefined,
                                                    }));
                                            }}
                                            className={`${signupStyles.input} ${errors.adminCode ? signupStyles.inputError : signupStyles.inputNormal}`}
                                            placeholder="Enter private admin code"
                                            required
                                        />
                                    </div>
                                    {errors.adminCode && (
                                        <p className={signupStyles.errorText}>{errors.adminCode}</p>
                                    )}
                                </label>
                            )}

                            {submitError && (
                                <p className={signupStyles.submitError} role='alert'>{submitError}</p>
                            )}

                            <div className={signupStyles.buttonsContainer}>
                                <button
                                    type='submit'
                                    disabled={loading}
                                    className={signupStyles.submitButton}
                                >
                                    {loading ? "Creating account ... " : "Create Account"}
                                </button>

                            </div>
                        </div>
                    </div>
                </form>

                <div className={signupStyles.loginPromptContainer}>
                    <div className={signupStyles.loginPromptContent}>
                        <span className={signupStyles.loginPromptText}>
                            Already have an account ?
                        </span>
                        <Link to="/login" className={signupStyles.loginPromptLink} >
                            Login
                        </Link>
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default Signup
