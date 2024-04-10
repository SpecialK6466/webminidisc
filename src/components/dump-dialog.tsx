import React, { useState, useCallback } from 'react';
import { useDispatch } from '../frontend-utils';
import { useShallowEqualSelector } from "../frontend-utils";

import { downloadTracks, recordTracks } from '../redux/actions';
import { actions as dumpDialogActions } from '../redux/dump-dialog-feature';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide, { SlideProps } from '@mui/material/Slide';
import Button from '@mui/material/Button';
import { makeStyles } from 'tss-react/mui';
import Typography from '@mui/material/Typography';
import serviceRegistry from '../services/registry';
import { TransitionProps } from '@mui/material/transitions';
import { W95DumpDialog } from './win95/dump-dialog';
import { exploitDownloadTracks } from '../redux/factory/factory-actions';
import { LineInDeviceSelect } from './line-in-helpers';

const Transition = React.forwardRef(function Transition(
    props: SlideProps,
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles()(theme => ({
    head: {
        textShadow: '0px 0px 12px rgba(150, 150, 150, 1)',
        fontSize: theme.typography.h2.fontSize,
        textAlign: 'center',
        marginBottom: theme.spacing(2),
    },
}));

export const DumpDialog = ({
    trackIndexes,
    isCapableOfDownload,
    isExploitDownload,
}: {
    trackIndexes: number[];
    isCapableOfDownload: boolean;
    isExploitDownload: boolean;
}) => {
    const dispatch = useDispatch();
    const { classes } = useStyles();

    const [inputDeviceId, setInputDeviceId] = useState<string>('');

    const { visible } = useShallowEqualSelector(state => state.dumpDialog);
    const { deviceCapabilities } = useShallowEqualSelector(state => state.main);

    const handleClose = useCallback(() => {
        setInputDeviceId('');
        serviceRegistry.mediaRecorderService?.stopTestInput();
        dispatch(dumpDialogActions.setVisible(false));
    }, [dispatch]);

    const handleChange = useCallback(
        (ev: React.ChangeEvent<{ value: unknown }>) => {
            if (isCapableOfDownload) return;
            const deviceId = ev.target.value as string;
            setInputDeviceId(deviceId);
            serviceRegistry.mediaRecorderService?.stopTestInput();
            serviceRegistry.mediaRecorderService?.playTestInput(deviceId);
        },
        [setInputDeviceId, isCapableOfDownload]
    );

    const handleStartRecord = useCallback(() => {
        dispatch(recordTracks(trackIndexes, inputDeviceId));
        handleClose();
    }, [dispatch, handleClose, inputDeviceId, trackIndexes]);

    const handleStartTransfer = useCallback(
        (convertToWav: boolean = false) => {
            if (isExploitDownload) {
                dispatch(exploitDownloadTracks(trackIndexes, convertToWav));
            } else {
                dispatch(downloadTracks(trackIndexes, convertToWav));
            }
            handleClose();
        },
        [trackIndexes, dispatch, handleClose, isExploitDownload]
    );

    const vintageMode = useShallowEqualSelector(state => state.appState.vintageMode);

    if (vintageMode) {
        const p = {
            handleClose,
            handleChange,
            handleStartTransfer,
            visible,
            deviceCapabilities,
            inputDeviceId,
            isCapableOfDownload,
        };
        return <W95DumpDialog {...p} />;
    }

    return (
        <Dialog
            open={visible}
            maxWidth={'sm'}
            fullWidth={true}
            TransitionComponent={Transition as any}
            aria-labelledby="dump-dialog-slide-title"
            aria-describedby="dump-dialog-slide-description"
        >
            <DialogTitle id="dump-dialog-slide-title">{isCapableOfDownload ? 'Download' : 'Record'} Selected Tracks</DialogTitle>
            <DialogContent>
                <Typography component="p" variant="h2" className={classes.head}>
                    {`💽 ⮕ 💻`}
                </Typography>
                {isCapableOfDownload ? (
                    <React.Fragment>
                        {isExploitDownload ? (
                            <React.Fragment>
                                <Typography component="p" variant="body2">
                                    As you have enabled factory mode ripping in main ui, you can download tracks via USB.
                                </Typography>
                                <Typography component="p" variant="body2">
                                    Please keep in mind that this functionality is not stable.
                                </Typography>
                            </React.Fragment>
                        ) : (
                            <Typography component="p" variant="body2">
                                As your device natively supports USB audio transfer, it is possible to transfer tracks via NetMD.
                            </Typography>
                        )}
                    </React.Fragment>
                ) : (
                    <LineInDeviceSelect inputDeviceId={inputDeviceId} handleChange={handleChange} />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                {isCapableOfDownload ? (
                    <>
                        <Button onClick={() => handleStartTransfer(true)}>Download and convert</Button>
                        <Button onClick={() => handleStartTransfer(false)}>Download</Button>
                    </>
                ) : (
                    <Button onClick={handleStartRecord} disabled={inputDeviceId === ''}>
                        Start Record
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};
