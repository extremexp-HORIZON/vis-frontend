import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import { useEffect, useState } from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
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
  const from = location.state?.from || '/';

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
    if (token) {
      // Redirect to the main page or dashboard after successful login
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    }
  }, [token, from, navigate]);

  return (
    <div id="error-page">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          rowGap: 20,
          userSelect: 'none',
          flexDirection: 'column',
        }}
      >
        <img src="/images/extremexp-logo.png" height={130} alt="ExtremeXP Logo" />
        <div style={{ display: 'flex', flexDirection: 'column', rowGap: 0, textAlign: 'center' }}>
          <h3 style={{ marginBottom: 2 }}>Login to Your Account</h3>
          <p style={{ fontSize: '14px', margin: 0, marginBottom: '2rem', color: theme.palette.error.main, height: '17px' }}>
            {typeof error === 'string'
              ? error
              : error instanceof Error
                ? error.message
                : ' '
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', rowGap: 20 }}>
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
      </form>
    </div>
  );
};

export default LoginPage;
