import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../src/theme';
import Container from '../layout/container';


export default function App({ Component, pageProps }) {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <Container>
          <Component {...pageProps} />
        </Container>
    </ThemeProvider>
  )
}
