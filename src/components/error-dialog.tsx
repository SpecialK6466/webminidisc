import React, { useCallback } from 'react';
import { useDispatch } from '../frontend-utils';
import { useShallowEqualSelector } from "../frontend-utils";

import { actions as errorDialogActions } from '../redux/error-dialog-feature';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide, { SlideProps } from '@mui/material/Slide';
import Button from '@mui/material/Button';
import { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
    props: SlideProps,
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const ErrorDialog = (props: {}) => {
    const dispatch = useDispatch();

    const { visible, error } = useShallowEqualSelector(state => state.errorDialog);

    const handleClose = useCallback(() => {
        dispatch(errorDialogActions.setVisible(false));
    }, [dispatch]);

    return (
        <Dialog
            open={visible}
            maxWidth={'sm'}
            fullWidth={true}
            TransitionComponent={Transition as any}
            aria-labelledby="error-dialog-slide-title"
            aria-describedby="error-dialog-slide-description"
        >
            <DialogTitle id="alert-dialog-slide-title">Error</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">{error}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};
