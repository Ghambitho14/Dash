import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bike, User, Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [touched, setTouched] = useState({ username: false, password: false });

  // Calcular fuerza de contraseña
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const strengthColor = 
    passwordStrength >= 75 ? '#10b981' : 
    passwordStrength >= 50 ? '#f59e0b' : 
    passwordStrength >= 25 ? '#f97316' : '#ef4444';

  const strengthLabel = 
    passwordStrength >= 75 ? 'Fuerte' : 
    passwordStrength >= 50 ? 'Media' : 
    passwordStrength >= 25 ? 'Débil' : 'Muy débil';

  const validateUsername = (value: string) => {
    if (!value) return 'El usuario es requerido';
    if (value.length < 3) return 'Mínimo 3 caracteres';
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return 'La contraseña es requerida';
    if (value.length < 6) return 'Mínimo 6 caracteres';
    return '';
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (touched.username) {
      setErrors(prev => ({ ...prev, username: validateUsername(value) }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      setErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);
    
    setTouched({ username: true, password: true });
    setErrors({ username: usernameError, password: passwordError });
    
    if (usernameError || passwordError) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    onLogin(username);
  };

  return (
    <>
      <div style={styles.container}>
        {/* Partículas de fondo animadas */}
        <div style={styles.particlesContainer}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.particle,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${Math.random() * 10 + 15}s`,
              }}
            />
          ))}
        </div>

        {/* Header con efectos premium */}
        <div style={styles.header} className="header">
          {/* Gradiente animado de fondo */}
          <div style={styles.animatedGradient} className="animated-gradient" />
          
          {/* Efecto de cristal con luces en movimiento */}
          <div style={styles.glassEffect}>
            <div style={{...styles.lightBeam, animationDelay: '0s'}}></div>
            <div style={{...styles.lightBeam, animationDelay: '3s'}}></div>
            <div style={{...styles.lightBeam, animationDelay: '6s'}}></div>
            <div style={{...styles.floatingLight, width: '120px', height: '120px', top: '15%', left: '-60px', animationDelay: '0s'}}></div>
            <div style={{...styles.floatingLight, width: '80px', height: '80px', top: '45%', left: '-40px', animationDelay: '4s'}}></div>
            <div style={{...styles.floatingLight, width: '100px', height: '100px', top: '70%', left: '-50px', animationDelay: '8s'}}></div>
            <div style={{...styles.floatingLight, width: '150px', height: '150px', top: '30%', left: '-75px', animationDelay: '12s'}}></div>
            <div style={styles.frostOverlay}></div>
          </div>
          
          <div style={styles.headerContent}>
            {/* Logo con efectos premium */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              style={styles.logoWrapper}
            >
              <div style={styles.logoGlow} className="logo-glow" />
              <div style={styles.logoContainer}>
                <Bike style={styles.logoIcon} strokeWidth={2.5} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 style={styles.headerTitle}>
                DeliveryApp
                <Sparkles style={styles.sparkleIcon} />
              </h1>
              <p style={styles.headerSubtitle}>Repartidores profesionales</p>
            </motion.div>
            
            {/* Tagline para tablet/desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={styles.desktopTagline}
              className="desktop-tagline"
            >
              <p style={styles.taglineText}>Entregas rápidas y seguras con tecnología de vanguardia</p>
              <div style={styles.taglineBadges}>
                <span style={styles.badge}>🚀 Rápido</span>
                <span style={styles.badge}>🔒 Seguro</span>
                <span style={styles.badge}>⚡ Eficiente</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Card de login con glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          style={styles.card}
          className="login-card"
        >
          <div style={styles.cardGlow} className="card-glow" />
          
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>¡Bienvenido de nuevo!</h2>
            <p style={styles.cardDescription}>Ingresa tus credenciales para continuar</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Campo Usuario */}
            <div style={styles.formGroup}>
              <label htmlFor="username" style={styles.label}>
                <User style={styles.labelIcon} />
                <span>Usuario</span>
                {username && !errors.username && (
                  <CheckCircle2 style={styles.successIcon} />
                )}
              </label>
              <div style={styles.inputWrapper}>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, username: true }))}
                  placeholder="Ingresa tu usuario"
                  style={{
                    ...styles.input,
                    borderColor: touched.username && errors.username ? '#ef4444' : 
                                touched.username && !errors.username && username ? '#10b981' : '#f3f4f6',
                  }}
                  className="form-input"
                />
                <AnimatePresence>
                  {touched.username && errors.username && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={styles.errorMessage}
                    >
                      <AlertCircle style={styles.errorIcon} />
                      <span>{errors.username}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Campo Contraseña */}
            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                <Lock style={styles.labelIcon} />
                <span>Contraseña</span>
                {password && !errors.password && (
                  <CheckCircle2 style={styles.successIcon} />
                )}
              </label>
              <div style={styles.inputWrapper}>
                <div style={styles.passwordWrapper}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                    placeholder="Ingresa tu contraseña"
                    style={{
                      ...styles.input,
                      paddingRight: '3.5rem',
                      borderColor: touched.password && errors.password ? '#ef4444' : 
                                  touched.password && !errors.password && password ? '#10b981' : '#f3f4f6',
                    }}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                    className="password-toggle"
                  >
                    {showPassword ? (
                      <EyeOff style={styles.passwordIcon} />
                    ) : (
                      <Eye style={styles.passwordIcon} />
                    )}
                  </button>
                </div>
                
                {/* Barra de fuerza de contraseña */}
                <AnimatePresence>
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={styles.strengthContainer}
                    >
                      <div style={styles.strengthBar}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength}%` }}
                          style={{
                            ...styles.strengthFill,
                            backgroundColor: strengthColor,
                          }}
                        />
                      </div>
                      <span style={{...styles.strengthLabel, color: strengthColor}}>
                        {strengthLabel}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {touched.password && errors.password && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={styles.errorMessage}
                    >
                      <AlertCircle style={styles.errorIcon} />
                      <span>{errors.password}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Olvidaste tu contraseña */}
            <div style={styles.forgotWrapper}>
              <button
                type="button"
                style={styles.forgotBtn}
                className="forgot-btn"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón Iniciar Sesión con efectos premium */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              style={{
                ...styles.loginButton,
                opacity: isLoading ? 0.8 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
              className="login-button"
            >
              <div style={styles.buttonGlow} className="button-glow" />
              <div style={styles.buttonContent}>
                {isLoading ? (
                  <>
                    <div style={styles.spinner} className="spinner" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight style={styles.arrowIcon} />
                  </>
                )}
              </div>
            </motion.button>
          </form>

          {/* Footer info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={styles.cardFooter}
          >
            <p style={styles.footerText}>
              🔒 Tus datos están protegidos con encriptación de nivel empresarial
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Estilos CSS con animaciones ultra premium */}
      <style>{`
        /* Animaciones */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes moveLight {
          0% { transform: translateX(-100%) skewY(-10deg); }
          100% { transform: translateX(50%) skewY(-10deg); }
        }
        
        @keyframes floatLight {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 0;
          }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% {
            transform: translateX(calc(100vw + 200px)) translateY(-80px);
            opacity: 0;
          }
        }

        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% { opacity: 0.6; }
          50% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0.6;
          }
          90% { opacity: 0.6; }
          100% {
            transform: translateY(-100vh) translateX(0);
            opacity: 0;
          }
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.95); }
        }

        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        /* Efectos hover y focus premium */
        .form-input:focus {
          border-color: #2b73ee !important;
          box-shadow: 0 0 0 4px rgba(43, 115, 238, 0.1), 0 0 20px rgba(43, 115, 238, 0.2) !important;
          transform: translateY(-1px);
        }

        .password-toggle:hover {
          color: #2b73ee;
          transform: translateY(-50%) scale(1.1);
        }

        .password-toggle:active {
          transform: translateY(-50%) scale(0.95);
        }

        .forgot-btn:hover {
          text-decoration: underline;
          color: #2b73ee;
        }

        .login-button {
          position: relative;
          overflow: hidden;
        }

        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -10px rgba(3, 92, 232, 0.6);
        }

        .login-button:hover .button-glow {
          opacity: 1;
        }

        .login-button:active {
          transform: translateY(0);
        }

        .logo-glow {
          animation: glow 3s ease-in-out infinite;
        }

        .card-glow {
          animation: glow 4s ease-in-out infinite;
        }

        .animated-gradient {
          animation: gradientShift 15s ease infinite;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        /* Responsive - Tablet y Desktop */
        @media (min-width: 768px) {
          body > div > div:first-child {
            flex-direction: row !important;
            align-items: stretch !important;
            padding: 2rem !important;
            background: #0f172a !important;
          }

          .header {
            flex: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 4rem !important;
            min-height: 650px !important;
            border-radius: 2rem 0 0 2rem !important;
            position: relative !important;
            overflow: hidden !important;
          }

          .login-card {
            flex: 1 !important;
            border-radius: 0 2rem 2rem 0 !important;
            padding: 3.5rem !important;
            max-width: 550px !important;
            min-height: 650px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2) !important;
            background: rgba(255, 255, 255, 0.98) !important;
            backdrop-filter: blur(20px) !important;
          }

          .desktop-tagline {
            display: block !important;
          }
        }

        @media (min-width: 1024px) {
          .header {
            padding: 5rem !important;
          }

          .login-card {
            padding: 4.5rem !important;
          }
        }

        @media (min-width: 1280px) {
          body > div > div:first-child {
            padding: 3rem !important;
          }
        }
      `}</style>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #035ce8 0%, #2b73ee 50%, #528af4 100%)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  particlesContainer: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
  },

  particle: {
    position: 'absolute',
    bottom: '-10px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.6)',
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
    animation: 'floatParticle 20s infinite ease-in-out',
  },

  header: {
    paddingTop: '3rem',
    paddingBottom: '2.5rem',
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
  },

  animatedGradient: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(-45deg, rgba(3, 92, 232, 0.3), rgba(43, 115, 238, 0.3), rgba(82, 138, 244, 0.3), rgba(122, 161, 249, 0.3))',
    backgroundSize: '400% 400%',
    zIndex: 1,
  },

  glassEffect: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    zIndex: 2,
  },

  lightBeam: {
    position: 'absolute',
    width: '200%',
    height: '180px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 25%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 100%)',
    transform: 'skewY(-10deg)',
    animation: 'moveLight 10s linear infinite',
  },

  floatingLight: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
    filter: 'blur(2px)',
    animation: 'floatLight 18s linear infinite',
  },

  frostOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.12) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
    backdropFilter: 'blur(2px)',
  },

  headerContent: {
    position: 'relative',
    zIndex: 10,
  },

  logoWrapper: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '2rem',
  },

  logoGlow: {
    position: 'absolute',
    inset: '-20px',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(20px)',
    zIndex: 1,
  },

  logoContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '7rem',
    height: '7rem',
    backgroundColor: 'white',
    borderRadius: '2rem',
    boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
    zIndex: 10,
  },

  logoIcon: {
    width: '3.5rem',
    height: '3.5rem',
    color: '#035ce8',
  },

  headerTitle: {
    color: 'white',
    fontSize: '2.25rem',
    fontWeight: '800',
    margin: '0 0 0.75rem 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },

  sparkleIcon: {
    width: '1.5rem',
    height: '1.5rem',
    color: '#fbbf24',
  },

  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: '1.125rem',
    fontWeight: '500',
    margin: 0,
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  },

  desktopTagline: {
    display: 'none',
  },

  taglineText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '1rem',
    lineHeight: '1.6',
    margin: '0 0 1.5rem 0',
    maxWidth: '400px',
  },

  taglineBadges: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  badge: {
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '2rem',
    fontSize: '0.875rem',
    color: 'white',
    fontWeight: '500',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  },

  card: {
    position: 'relative',
    backgroundColor: 'white',
    borderTopLeftRadius: '2.5rem',
    borderTopRightRadius: '2.5rem',
    boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.1)',
    padding: '3rem 1.75rem 2.5rem 1.75rem',
    zIndex: 10,
  },

  cardGlow: {
    position: 'absolute',
    top: '-100px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(43, 115, 238, 0.3) 0%, transparent 70%)',
    filter: 'blur(40px)',
    pointerEvents: 'none',
    zIndex: -1,
  },

  cardHeader: {
    marginBottom: '2.5rem',
  },

  cardTitle: {
    color: '#111827',
    fontSize: '1.75rem',
    fontWeight: '700',
    margin: '0 0 0.75rem 0',
  },

  cardDescription: {
    color: '#6b7280',
    fontSize: '0.95rem',
    margin: 0,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
  },

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },

  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#374151',
    marginBottom: '0.75rem',
    fontSize: '0.9rem',
    fontWeight: '600',
  },

  labelIcon: {
    width: '1.125rem',
    height: '1.125rem',
    color: '#2b73ee',
  },

  successIcon: {
    width: '1rem',
    height: '1rem',
    color: '#10b981',
    marginLeft: 'auto',
  },

  inputWrapper: {
    position: 'relative',
  },

  input: {
    width: '100%',
    padding: '1.125rem 1.25rem',
    backgroundColor: '#f9fafb',
    border: '2px solid #f3f4f6',
    borderRadius: '1.125rem',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontSize: '1rem',
    fontFamily: 'inherit',
  },

  passwordWrapper: {
    position: 'relative',
  },

  passwordToggle: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.625rem',
    transition: 'all 0.2s',
    borderRadius: '0.5rem',
  },

  passwordIcon: {
    width: '1.25rem',
    height: '1.25rem',
  },

  strengthContainer: {
    marginTop: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },

  strengthBar: {
    flex: 1,
    height: '6px',
    backgroundColor: '#f3f4f6',
    borderRadius: '3px',
    overflow: 'hidden',
  },

  strengthFill: {
    height: '100%',
    transition: 'all 0.3s',
    borderRadius: '3px',
  },

  strengthLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
  },

  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.625rem',
    color: '#ef4444',
    fontSize: '0.813rem',
    fontWeight: '500',
  },

  errorIcon: {
    width: '1rem',
    height: '1rem',
  },

  forgotWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '-0.5rem',
  },

  forgotBtn: {
    color: '#035ce8',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    transition: 'all 0.2s',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    fontWeight: '500',
  },

  loginButton: {
    width: '100%',
    background: 'linear-gradient(135deg, #035ce8 0%, #2b73ee 100%)',
    color: 'white',
    padding: '1.125rem',
    borderRadius: '1.125rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 10px 25px -5px rgba(3, 92, 232, 0.5)',
    fontSize: '1.063rem',
    fontWeight: '600',
    fontFamily: 'inherit',
    marginTop: '1rem',
    position: 'relative',
  },

  buttonGlow: {
    position: 'absolute',
    inset: 0,
    borderRadius: '1.125rem',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s',
  },

  buttonContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.625rem',
    zIndex: 1,
  },

  spinner: {
    width: '1.25rem',
    height: '1.25rem',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
  },

  arrowIcon: {
    width: '1.25rem',
    height: '1.25rem',
  },

  cardFooter: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #f3f4f6',
  },

  footerText: {
    fontSize: '0.813rem',
    color: '#6b7280',
    textAlign: 'center',
    margin: 0,
    lineHeight: '1.5',
  },
};