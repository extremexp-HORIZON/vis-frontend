import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import { useEffect, useState, useMemo } from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAppDispatch, useAppSelector } from '../../store/store';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../../store/slices/authSlice';

const LoginPage = () => {
  const [loginInfo, setLoginInfo] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { token, isLoading, error } = useAppSelector(state => state.auth);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to previous location from state, or default to home
  const from = useMemo(() => location.state?.from || '/', [location.state?.from]);

  const handleLoginInfoChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string,
  ) => {
    const { value } = event.target;

    setLoginInfo(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleClickShowPassword = () => setShowPassword(show => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    dispatch(loginUser(loginInfo));
  };

  useEffect(() => {
    // Only navigate if token exists AND it's still in localStorage
    const storedToken = localStorage.getItem('auth_token');

    if (token && storedToken === token) {
      // Redirect to the main page or dashboard after successful login
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    }
  }, [token, navigate, from]);

  // Brand login background — a one-off neutral with no theme-token equivalent.
  const pageBg = theme.palette.mode === 'dark' ? theme.palette.background.default : '#E6E6E6';

  return (
    <Box
      id="error-page"
      sx={{
        backgroundColor: pageBg,
        transition: 'background-color 0.3s',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          rowGap: 2.5,
          userSelect: 'none',
          flexDirection: 'column',
        }}
      >
        <Box
          component="img"
          src={theme.palette.mode === 'dark' ? '/images/extremexp-logo-removebg-preview.png' : '/images/extremexp-logo.png'}
          alt="ExtremeXP Logo"
          sx={{ height: 130, backgroundColor: pageBg }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
          <Typography variant="h6" component="h3" sx={{ mb: '2px', fontWeight: 700 }}>
            Login to Your Account
          </Typography>
          <Typography sx={{ fontSize: 14, m: 0, mb: 4, color: 'error.main', height: 17 }}>
            {typeof error === 'string'
              ? error
              : error instanceof Error
                ? error.message
                : ' '
            }
          </Typography>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', rowGap: 2.5 }}>
        <TextField
          id="username"
          name="username"
          label="Username"
          variant="standard"
          sx={{ width: '25ch' }}
          value={loginInfo.username}
          onChange={event => handleLoginInfoChange(event, 'username')}
          autoComplete="username"
          required
        />
        <FormControl sx={{ width: '25ch' }} variant="standard">
          <InputLabel htmlFor="password">Password</InputLabel>
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            onChange={event => handleLoginInfoChange(event, 'password')}
            value={loginInfo.password}
            autoComplete="current-password"
            required
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    showPassword ? 'hide the password' : 'display the password'
                  }
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          sx={{ textTransform: 'none', borderRadius: 14 }}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress
              size={24}
              sx={{ color: theme => theme.palette.customGrey.main }}
            />
          ) : (
            'Sign In'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default LoginPage;
