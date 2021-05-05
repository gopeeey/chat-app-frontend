import { createMuiTheme } from '@material-ui/core/styles';


const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#A83328'
        },
        secondary: {
            main: '#ffffff'
        },
        transPrimary: {
            main: 'rgba(0, 162, 5, 0.7)',
            light: 'rgb(0, 162, 5, 0.4)',
            dark: 'rgb(0, 162, 5, 0.849567)'
        },
        transSecondary: {
            main: 'rgba(250, 250, 250, 0.8)',
            light: 'rgba(250, 250, 250, 0.4)',
            dark: 'rgba(250, 250, 250, 0.849567)'
        },
        link: {
            main: '#0d81b6',
        }
    },
});

export default theme;