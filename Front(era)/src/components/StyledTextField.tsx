import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

const StyledTextField: React.FC<TextFieldProps> = (props) => {
    return (
        <TextField
            {...props}
            variant="standard"
            fullWidth
            InputLabelProps={{
                sx: {
                    fontFamily: "'Albert Sans', sans-serif !important",
                    color: 'gray',
                    '&.Mui-focused': {
                        color: '#A6B240',
                    },
                },
            }}
            InputProps={{
                sx: {
                    fontFamily: "'Albert Sans', sans-serif !important",
                    color: 'gray',
                    '& input': {
                        fontFamily: "'Albert Sans', sans-serif !important",
                    },
                    '&:after': {
                        borderBottom: '2px solid #A6B240',
                    },
                    '&:before': {
                        borderBottom: '1px solid gray',
                    },
                },
            }}
        />
    );
};

export default StyledTextField;
