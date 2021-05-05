import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {
    Typography,
    Grow
} from '@material-ui/core';


const useStyles = makeStyles(theme => ({
    root: {
        width: '20px',
        height: '20px',
        backgroundColor: theme.palette.secondary.main,
        borderRadius: '3em',
        textAlign: 'center'
    },
    text: {
        fontWeight: 'bold'
    }
}));


export default function Badge (props) {
    const classes = useStyles();
    const {
        text,
        visible
    } = props;

    return (
        <Grow in={visible}>
            <div className={classes.root}>
            <Typography variant="body2" className={classes.text}>
                {text}
            </Typography>
        </div>
        </Grow>
    )
}