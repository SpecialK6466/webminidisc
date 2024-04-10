import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useShallowEqualSelector } from "../../frontend-utils";

import { makeStyles } from 'tss-react/mui';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide, { SlideProps } from '@mui/material/Slide';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { TransitionProps } from '@mui/material/transitions';
import { actions as factoryEditOtherValuesDialogActions } from '../../redux/factory/factory-edit-other-values-dialog-feature';
import { actions as factoryActions } from '../../redux/factory/factory-feature';
import { ToC } from 'netmd-tocmanip';
import { batchActions } from 'redux-batched-actions';

const Transition = React.forwardRef(function Transition(
    props: SlideProps,
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles()(theme => ({
    marginUpDown: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
}));

function asByte(e: any, callback: (e: number) => void) {
    const asNumber = parseInt(e.target.value);
    if (asNumber >= 0 && asNumber < 256) callback(asNumber);
}

export const FactoryModeEditOtherValuesDialog = (props: {}) => {
    const dispatch = useDispatch();
    const { classes } = useStyles();

    const { visible } = useShallowEqualSelector(state => state.factoryEditOtherValuesDialog);
    const { toc: globalToc } = useShallowEqualSelector(state => state.factory);

    const [tocWorkingCopy, setTocWorkingCopy] = useState<ToC | undefined>(globalToc);

    // When the dialog becomes visible
    useEffect(() => {
        if (visible) {
            setTocWorkingCopy({ ...globalToc! });
        }
    }, [visible, setTocWorkingCopy, globalToc]);

    const handleClose = useCallback(() => {
        dispatch(factoryEditOtherValuesDialogActions.setVisible(false));
    }, [dispatch]);

    const handleUpdate = useCallback(() => {
        dispatch(batchActions([factoryActions.setToc(tocWorkingCopy!), factoryActions.setModified(true)]));
        handleClose();
    }, [dispatch, tocWorkingCopy, handleClose]);

    return (
        <Dialog
            open={visible}
            onClose={handleClose}
            maxWidth={'sm'}
            fullWidth={true}
            TransitionComponent={Transition as any}
            aria-labelledby="factory-fragment-mode-dialog-title"
        >
            <DialogTitle id="factory-fragment-mode-dialog-title">Edit Other ToC Values</DialogTitle>
            <DialogContent>
                <TextField
                    label="Number of Tracks"
                    className={classes.marginUpDown}
                    fullWidth
                    value={tocWorkingCopy?.nTracks}
                    onChange={e => asByte(e, e => setTocWorkingCopy({ ...tocWorkingCopy!, nTracks: e }))}
                />
                <TextField
                    label="The last ToC writer's signature"
                    className={classes.marginUpDown}
                    fullWidth
                    value={tocWorkingCopy?.deviceSignature}
                    onChange={e => asByte(e, e => setTocWorkingCopy({ ...tocWorkingCopy!, deviceSignature: e }))}
                />
                <TextField
                    label="Disc nonempty flag"
                    className={classes.marginUpDown}
                    fullWidth
                    value={tocWorkingCopy?.discNonEmpty}
                    onChange={e => asByte(e, e => setTocWorkingCopy({ ...tocWorkingCopy!, discNonEmpty: e }))}
                />
                <TextField
                    label="Next Free Track Slot"
                    className={classes.marginUpDown}
                    fullWidth
                    value={tocWorkingCopy?.nextFreeTrackSlot}
                    onChange={e => asByte(e, e => setTocWorkingCopy({ ...tocWorkingCopy!, nextFreeTrackSlot: e }))}
                />
                <TextField
                    label="Next Free Title Slot"
                    className={classes.marginUpDown}
                    fullWidth
                    value={tocWorkingCopy?.nextFreeTitleSlot}
                    onChange={e => asByte(e, e => setTocWorkingCopy({ ...tocWorkingCopy!, nextFreeTitleSlot: e }))}
                />
                <TextField
                    label="Next Free Timestamp Slot"
                    className={classes.marginUpDown}
                    fullWidth
                    value={tocWorkingCopy?.nextFreeTimestampSlot}
                    onChange={e => asByte(e, e => setTocWorkingCopy({ ...tocWorkingCopy!, nextFreeTimestampSlot: e }))}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button color={'primary'} onClick={handleUpdate}>
                    Update
                </Button>
            </DialogActions>
        </Dialog>
    );
};
