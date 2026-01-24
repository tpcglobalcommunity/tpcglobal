import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { signUpWithInvitation, validateInvitationCode, checkUsernameAvailable } from '@/lib/supabase';
import { langPath } from '@/utils/langPath';
import { Mail, User, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FormData {
  invitationCode: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors extends Partial<FormData> {
  submit?: string;
}

interface ValidationState {
  invitationCode: 'idle' | 'validating' | 'valid' | 'invalid';
  username: 'idle' | 'validating' | 'valid' | 'invalid';
}

export const ProductionSignUp: React.FC<{ lang: 'en' | 'id' }> = ({ lang }) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    invitationCode: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [validation, setValidation] = useState<ValidationState>({
    invitationCode: 'idle',
    username: 'idle'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Debounced validation functions
  const validateInvitationCodeDebounced = useCallback(
    async (code: string) => {
      if (!code.trim()) {
        setValidation(prev => ({ ...prev, invitationCode: 'idle' }));
        return;
      }

      setValidation(prev => ({ ...prev, invitationCode: 'validating' }));
      
      try {
        const isValid = await validateInvitationCode(code.trim().toUpperCase());
        setValidation(prev => ({ 
          ...prev, 
          invitationCode: isValid ? 'valid' : 'invalid' 
        }));
        
        if (!isValid) {
          setErrors(prev => ({ ...prev, invitationCode: t('signup.errors.invitationInvalid') }));
        } else {
          setErrors(prev => ({ ...prev, invitationCode: undefined }));
        }
      } catch (error) {
        setValidation(prev => ({ ...prev, invitationCode: 'invalid' }));
        setErrors(prev => ({ ...prev, invitationCode: t('signup.errors.invitationInvalid') }));
      }
    },
    [t]
  );

  const validateUsernameDebounced = useCallback(
    async (username: string) => {
      if (!username.trim()) {
        setValidation(prev => ({ ...prev, username: 'idle' }));
        return;
      }

      if (username.length < 3) {
        setValidation(prev => ({ ...prev, username: 'invalid' }));
        setErrors(prev => ({ ...prev, username: t('signup.errors.usernameFormat') }));
        return;
      }

      setValidation(prev => ({ ...prev, username: 'validating' }));
      
      try {
        const isAvailable = await checkUsernameAvailable(username.trim());
        setValidation(prev => ({ 
          ...prev, 
          username: isAvailable ? 'valid' : 'invalid' 
        }));
        
        if (!isAvailable) {
          setErrors(prev => ({ ...prev, username: t('signup.errors.usernameTaken') }));
        } else {
          setErrors(prev => ({ ...prev, username: undefined }));
        }
      } catch (error) {
        setValidation(prev => ({ ...prev, username: 'invalid' }));
        setErrors(prev => ({ ...prev, username: t('signup.errors.usernameInvalid') }));
      }
    },
    [t]
  );

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Trigger validation for specific fields
    if (field === 'invitationCode') {
      validateInvitationCodeDebounced(value);
    } else if (field === 'username') {
      validateUsernameDebounced(value);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Invitation code validation
    if (!formData.invitationCode.trim()) {
      newErrors.invitationCode = t('signup.errors.inviteRequired');
    } else if (validation.invitationCode !== 'valid') {
      newErrors.invitationCode = t('signup.errors.inviteInvalid');
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = t('signup.errors.required');
    } else if (validation.username !== 'valid') {
      newErrors.username = t('signup.errors.usernameTaken');
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t('signup.errors.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('signup.errors.invalidEmail');
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t('signup.errors.required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('signup.errors.passwordMinLength');
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t('signup.errors.passwordWeak');
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('signup.errors.required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('signup.errors.passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signUpWithInvitation({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        invitationCode: formData.invitationCode.trim().toUpperCase()
      });

      setIsSuccess(true);
    } catch (error: any) {
      console.error('[SIGNUP] Error:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: error.message || t('signup.errors.generic') 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-[#101827] to-[#0b0f17] border border-[rgba(240,185,11,0.18)] rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-[#f0b90b] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[#0b0f17]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              {lang === 'id' ? 'Akun berhasil dibuat.' : 'Account successfully created.'}
            </h1>
            <p className="text-[rgba(231,237,247,0.82)] mb-8">
              {lang === 'id' 
                ? 'Silakan periksa email Anda untuk memverifikasi akun sebelum masuk.'
                : 'Please check your email to verify your account before logging in.'
              }
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.open('https://mail.google.com', '_blank')}
                className="w-full h-12 rounded-xl bg-[#f0b90b] text-[#0b0f17] font-semibold hover:bg-[#f0b90b]/90 transition-colors"
              >
                {lang === 'id' ? 'Buka Aplikasi Email' : 'Open Email App'}
              </button>
              
              <button
                onClick={() => navigate(langPath(lang, '/signin'))}
                className="w-full h-12 rounded-xl border border-white/20 bg-transparent text-white font-semibold hover:bg-white/10 transition-colors"
              >
                {lang === 'id' ? 'Ke Halaman Masuk' : 'Go to Login Page'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-[#101827] to-[#0b0f17] border border-[rgba(240,185,11,0.18)] rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('signup.title')}
            </h1>
            <p className="text-[rgba(231,237,247,0.82)]">
              {t('signup.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Invitation Code */}
            <div>
              <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                {t('signup.inviteCode.label')} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.invitationCode}
                  onChange={handleInputChange('invitationCode')}
                  placeholder={t('signup.inviteCode.placeholder')}
                  className={`w-full h-12 rounded-xl bg-white/5 border pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f0b90b]/50 focus:border-transparent transition-all ${
                    errors.invitationCode ? 'border-red-500/50 bg-red-500/5' : 'border-white/20'
                  }`}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  {validation.invitationCode === 'validating' && (
                    <Loader2 className="w-5 h-5 text-[#f0b90b] animate-spin" />
                  )}
                  {validation.invitationCode === 'valid' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {validation.invitationCode === 'invalid' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {(validation.invitationCode === 'idle' || validation.invitationCode === 'validating') && (
                    <Mail className="w-5 h-5 text-white/40" />
                  )}
                </div>
              </div>
              {errors.invitationCode && (
                <p className="mt-2 text-sm text-red-400">{errors.invitationCode}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                {t('signup.username.label')} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  placeholder={t('signup.username.placeholder')}
                  className={`w-full h-12 rounded-xl bg-white/5 border pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f0b90b]/50 focus:border-transparent transition-all ${
                    errors.username ? 'border-red-500/50 bg-red-500/5' : 'border-white/20'
                  }`}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  {validation.username === 'validating' && (
                    <Loader2 className="w-5 h-5 text-[#f0b90b] animate-spin" />
                  )}
                  {validation.username === 'valid' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {validation.username === 'invalid' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {(validation.username === 'idle' || validation.username === 'validating') && (
                    <User className="w-5 h-5 text-white/40" />
                  )}
                </div>
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-400">{errors.username}</p>
              )}
              <p className="mt-2 text-xs text-white/40">
                {t('signup.helpers.username')}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                {t('signup.email.label')} *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder={t('signup.email.placeholder')}
                  className={`w-full h-12 rounded-xl bg-white/5 border pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f0b90b]/50 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500/50 bg-red-500/5' : 'border-white/20'
                  }`}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Mail className="w-5 h-5 text-white/40" />
                </div>
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                {t('signup.password.label')} *
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  placeholder={t('signup.password.placeholder')}
                  className={`w-full h-12 rounded-xl bg-white/5 border pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f0b90b]/50 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500/50 bg-red-500/5' : 'border-white/20'
                  }`}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-5 h-5 text-white/40" />
                </div>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
              )}
              <p className="mt-2 text-xs text-white/40">
                {t('signup.password.helper')}
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                {t('signup.confirmPassword.label')} *
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  placeholder={t('signup.confirmPassword.placeholder')}
                  className={`w-full h-12 rounded-xl bg-white/5 border pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f0b90b]/50 focus:border-transparent transition-all ${
                    errors.confirmPassword ? 'border-red-500/50 bg-red-500/5' : 'border-white/20'
                  }`}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-5 h-5 text-white/40" />
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || validation.invitationCode !== 'valid' || validation.username !== 'valid'}
              className="w-full h-12 rounded-xl bg-[#f0b90b] text-[#0b0f17] font-semibold hover:bg-[#f0b90b]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('signup.loading')}
                </>
              ) : (
                t('signup.submit')
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              {t('signup.haveAccount')}{' '}
              <button
                onClick={() => navigate(langPath(lang, '/signin'))}
                className="text-[#f0b90b] hover:text-[#f0b90b]/80 font-medium"
              >
                {t('signup.signIn')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
