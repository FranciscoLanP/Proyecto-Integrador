'use client';

import React, { useState, ChangeEvent, FormEvent, JSX } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Fade,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockReset,
  ArrowBack,
  Security,
  VpnKey,
  Person,
  Close
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import {
  loginRequest,
  getSecretQuestionRequest,
  resetPasswordRequest
} from '../../services/authService';
import { useNotification } from '../../components/utils/NotificationProvider';
import SecretQuestionSetupModal from '../../components/SecretQuestionSetupModal';

const secretQuestions = [
  '¿Cuál es el nombre de tu primera mascota?',
  '¿En qué ciudad naciste?',
  '¿Cuál es el nombre de tu escuela primaria?',
  '¿Cuál es tu comida favorita?',
  '¿Cuál es el nombre de tu mejor amigo de la infancia?'
];

interface SecretQuestionSetupScreenProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SecretQuestionSetupScreen: React.FC<SecretQuestionSetupScreenProps> = ({ onClose, onSuccess }) => {
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedQuestion || !answer.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (answer.trim().length < 2) {
      setError('La respuesta debe tener al menos 2 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('tempToken');
      const response = await fetch('http://localhost:3001/api/auth/setup-secret-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          secretQuestion: selectedQuestion,
          secretAnswer: answer.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al configurar pregunta secreta');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al configurar pregunta secreta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          right: -150,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      <Fade in={true} timeout={800}>
        <Paper
          elevation={24}
          sx={{
            position: 'relative',
            zIndex: 1,
            p: 4,
            width: 480,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          }}
        >
          {success ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    color: 'white',
                    fontSize: '2rem'
                  }}
                >
                  ✓
                </Box>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 2 }}>
                ¡Configuración Completa!
              </Typography>
              <Typography variant="body1" sx={{ color: '#6b7280' }}>
                Tu pregunta secreta ha sido configurada correctamente.
                Ahora podrás recuperar tu contraseña si la olvidas.
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: 'white',
                    fontSize: '2rem'
                  }}
                >
                  🔒
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 1 }}>
                  Configuración de Seguridad
                </Typography>
                <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                  Requerida para completar tu acceso
                </Typography>
                <Alert severity="info" sx={{ borderRadius: 2, textAlign: 'left' }}>
                  <strong>🔒 Configuración de Seguridad Requerida</strong>
                  <br />
                  Para completar tu acceso al sistema y habilitar la recuperación de contraseña,
                  necesitas configurar una pregunta secreta.
                </Alert>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Pregunta Secreta</InputLabel>
                  <Select
                    value={selectedQuestion}
                    onChange={(e) => setSelectedQuestion(e.target.value)}
                    disabled={loading}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    {secretQuestions.map((question, index) => (
                      <MenuItem key={index} value={question}>
                        {question}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Respuesta"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  fullWidth
                  disabled={loading}
                  helperText="Recuerda tu respuesta exactamente como la escribes"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    }
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, pt: 2 }}>
                  <Button
                    onClick={onClose}
                    disabled={loading}
                    variant="text"
                    sx={{ color: '#6b7280' }}
                  >
                    Salir
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !selectedQuestion || !answer.trim()}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      '&:disabled': {
                        background: 'linear-gradient(45deg, #9ca3af 30%, #6b7280 90%)',
                      }
                    }}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {loading ? 'Configurando...' : 'Completar Configuración'}
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Fade>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </Box>
  );
};

export default function LoginPage(): JSX.Element {
  const { login } = useAuth();
  const { notify } = useNotification();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [setupQuestionModalOpen, setSetupQuestionModalOpen] = useState<boolean>(false);
  const [showSecretQuestionSetup, setShowSecretQuestionSetup] = useState<boolean>(false);

  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [resetStep, setResetStep] = useState<number>(0);
  const [resetData, setResetData] = useState({
    username: '',
    secretQuestion: '',
    secretAnswer: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  const [resetError, setResetError] = useState<string>('');

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Usuario y contraseña son obligatorios');
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginRequest({ username, password });
      const { token, usuario, hasSecretQuestion } = response;

      if (!hasSecretQuestion) {
        localStorage.setItem('tempToken', token);
        localStorage.setItem('tempUser', JSON.stringify(usuario));
        setShowSecretQuestionSetup(true);
      } else {
        login(usuario.username, usuario.role, token);
        notify('¡Bienvenido! Sesión iniciada correctamente', 'success');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      notify('Error al iniciar sesión', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setResetModalOpen(true);
    setResetStep(0);
    setResetData({
      username: '',
      secretQuestion: '',
      secretAnswer: '',
      newPassword: '',
      confirmPassword: ''
    });
    setResetError('');
  };

  const handleResetStep1 = async () => {
    if (!resetData.username) {
      setResetError('Ingrese su nombre de usuario');
      return;
    }

    setResetLoading(true);
    setResetError('');

    try {
      const response = await getSecretQuestionRequest({ username: resetData.username });
      setResetData(prev => ({ ...prev, secretQuestion: response.secretQuestion }));
      setResetStep(1);
    } catch (error: any) {
      setResetError(error.response?.data?.message || 'Usuario no encontrado');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetStep2 = async () => {
    if (!resetData.secretAnswer) {
      setResetError('Ingrese la respuesta a su pregunta secreta');
      return;
    }

    if (!resetData.newPassword || resetData.newPassword.length < 6) {
      setResetError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      setResetError('Las contraseñas no coinciden');
      return;
    }

    setResetLoading(true);
    setResetError('');

    try {
      await resetPasswordRequest({
        username: resetData.username,
        secretAnswer: resetData.secretAnswer,
        newPassword: resetData.newPassword
      });

      notify('Contraseña restablecida correctamente', 'success');
      setResetModalOpen(false);
      setResetStep(0);
    } catch (error: any) {
      setResetError(error.response?.data?.message || 'Error al restablecer contraseña');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSetupQuestionSuccess = () => {
    const tempToken = localStorage.getItem('tempToken');
    const tempUser = localStorage.getItem('tempUser');

    if (tempToken && tempUser) {
      const usuario = JSON.parse(tempUser);
      login(usuario.username, usuario.role, tempToken);

      localStorage.removeItem('tempToken');
      localStorage.removeItem('tempUser');

      notify('¡Pregunta secreta configurada! Bienvenido al sistema', 'success');
    } else {
      notify('Pregunta secreta configurada correctamente', 'success');
    }

    setShowSecretQuestionSetup(false);
  };

  const handleSetupQuestionClose = () => {
    localStorage.removeItem('tempToken');
    localStorage.removeItem('tempUser');
    setShowSecretQuestionSetup(false);
    notify('Debes configurar una pregunta secreta para continuar', 'warning');
  };

  const resetSteps = ['Verificar Usuario', 'Pregunta Secreta', 'Nueva Contraseña'];

  if (showSecretQuestionSetup) {
    return <SecretQuestionSetupScreen onClose={handleSetupQuestionClose} onSuccess={handleSetupQuestionSuccess} />;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          right: -150,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      <Fade in={true} timeout={800}>
        <Paper
          elevation={24}
          sx={{
            position: 'relative',
            zIndex: 1,
            p: 4,
            width: 420,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'white',
                fontSize: '2rem'
              }}
            >
              🏢
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: '#1f2937',
                mb: 1
              }}
            >
              JHS AutoServicios
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#6b7280' }}
            >
              Bienvenido de vuelta
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Usuario"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              fullWidth
              autoFocus
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: '#6b7280' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                }
              }}
            />

            <TextField
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKey sx={{ color: '#6b7280' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                borderRadius: 2,
                py: 1.5,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                  boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                },
                '&:disabled': {
                  background: 'linear-gradient(45deg, #9ca3af 30%, #6b7280 90%)',
                }
              }}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            <Divider sx={{ my: 1 }} />

            <Button
              variant="text"
              onClick={handleForgotPassword}
              disabled={isLoading}
              startIcon={<LockReset />}
              sx={{
                color: '#667eea',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                }
              }}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </Box>
        </Paper>
      </Fade>

      <Dialog
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          m: 0
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Security />
            <Typography variant="h6">Recuperar Contraseña</Typography>
          </Box>
          <IconButton onClick={() => setResetModalOpen(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stepper activeStep={resetStep} sx={{ mb: 3 }}>
            {resetSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {resetError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {resetError}
            </Alert>
          )}

          {resetStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Ingrese su nombre de usuario para continuar:
              </Typography>
              <TextField
                label="Nombre de Usuario"
                value={resetData.username}
                onChange={(e) => setResetData(prev => ({ ...prev, username: e.target.value }))}
                fullWidth
                disabled={resetLoading}
                autoFocus
              />
            </Box>
          )}

          {resetStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Responda su pregunta secreta:
              </Typography>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <strong>Pregunta:</strong> {resetData.secretQuestion}
              </Alert>
              <TextField
                label="Respuesta"
                value={resetData.secretAnswer}
                onChange={(e) => setResetData(prev => ({ ...prev, secretAnswer: e.target.value }))}
                fullWidth
                disabled={resetLoading}
                autoFocus
                helperText="La respuesta no distingue entre mayúsculas y minúsculas"
              />
              <TextField
                label="Nueva Contraseña"
                type="password"
                value={resetData.newPassword}
                onChange={(e) => setResetData(prev => ({ ...prev, newPassword: e.target.value }))}
                fullWidth
                disabled={resetLoading}
                helperText="Mínimo 6 caracteres"
              />
              <TextField
                label="Confirmar Nueva Contraseña"
                type="password"
                value={resetData.confirmPassword}
                onChange={(e) => setResetData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                fullWidth
                disabled={resetLoading}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          {resetStep > 0 && (
            <Button
              onClick={() => setResetStep(resetStep - 1)}
              startIcon={<ArrowBack />}
              disabled={resetLoading}
            >
              Anterior
            </Button>
          )}

          <Box sx={{ flex: 1 }} />

          <Button
            onClick={() => setResetModalOpen(false)}
            disabled={resetLoading}
          >
            Cancelar
          </Button>

          {resetStep === 0 && (
            <Button
              onClick={handleResetStep1}
              variant="contained"
              disabled={resetLoading || !resetData.username}
              startIcon={resetLoading ? <CircularProgress size={16} /> : null}
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              }}
            >
              {resetLoading ? 'Verificando...' : 'Continuar'}
            </Button>
          )}

          {resetStep === 1 && (
            <Button
              onClick={handleResetStep2}
              variant="contained"
              disabled={resetLoading || !resetData.secretAnswer || !resetData.newPassword || !resetData.confirmPassword}
              startIcon={resetLoading ? <CircularProgress size={16} /> : null}
              sx={{
                background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
              }}
            >
              {resetLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </Box>
  );
}
