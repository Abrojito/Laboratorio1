import React from 'react';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { TextField } from '@mui/material';

interface StyledTimePickerProps {
    value: string; // formato "HH:mm"
    onChange: (value: string) => void;
    label?: string;
}

const StyledTimePicker: React.FC<StyledTimePickerProps> = ({
                                                               value,
                                                               onChange,
                                                               label = 'Tiempo de elaboración',
                                                           }) => {
    const [hours, minutes] = value.split(':').map(Number);
    const dateValue = new Date();
    dateValue.setHours(hours || 0, minutes || 0, 0, 0);

    return (
        <TimePicker
            ampm={false}
            value={dateValue}
            onChange={(newValue) => {
                if (newValue instanceof Date && !isNaN(newValue.getTime())) {
                    const h = newValue.getHours().toString().padStart(2, '0');
                    const m = newValue.getMinutes().toString().padStart(2, '0');
                    onChange(`${h}:${m}`);
                }
            }}
            slotProps={{
                textField: {
                    fullWidth: true,
                    variant: 'standard',
                    label,
                    InputProps: {
                        sx: {
                            fontFamily: "'Albert Sans', sans-serif",
                            color: 'gray',
                            '&:after': { borderBottom: '2px solid #A6B240' },
                            '&:before': { borderBottom: '1px solid gray' },
                        },
                    },
                    InputLabelProps: {
                        sx: {
                            fontFamily: "'Albert Sans', sans-serif",
                            color: 'gray',
                            '&.Mui-focused': { color: '#A6B240' },
                        },
                    },
                },
            }}
        />
    );
};

export default StyledTimePicker;
