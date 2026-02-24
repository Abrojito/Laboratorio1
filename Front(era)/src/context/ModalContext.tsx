import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

type ConfirmOptions = {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
};

type PromptOptions = {
    title: string;
    label: string;
    initialValue?: string;
    confirmText?: string;
    cancelText?: string;
    required?: boolean;
    requiredMessage?: string;
};

type AlertOptions = {
    title: string;
    message: string;
    closeText?: string;
};

type ModalApi = {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
    prompt: (options: PromptOptions) => Promise<string | null>;
    alert: (options: AlertOptions) => Promise<void>;
};

type ActiveModal =
    | { kind: "confirm"; options: ConfirmOptions; resolve: (value: boolean) => void }
    | { kind: "prompt"; options: PromptOptions; resolve: (value: string | null) => void }
    | { kind: "alert"; options: AlertOptions; resolve: () => void }
    | null;

const ModalContext = createContext<ModalApi | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const [promptValue, setPromptValue] = useState("");
    const [promptError, setPromptError] = useState<string | null>(null);

    const confirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setActiveModal({ kind: "confirm", options, resolve });
        });
    }, []);

    const prompt = useCallback((options: PromptOptions) => {
        return new Promise<string | null>((resolve) => {
            setPromptValue(options.initialValue ?? "");
            setPromptError(null);
            setActiveModal({ kind: "prompt", options, resolve });
        });
    }, []);

    const alert = useCallback((options: AlertOptions) => {
        return new Promise<void>((resolve) => {
            setActiveModal({ kind: "alert", options, resolve });
        });
    }, []);

    const closeConfirm = (value: boolean) => {
        if (!activeModal || activeModal.kind !== "confirm") return;
        activeModal.resolve(value);
        setActiveModal(null);
    };

    const closePrompt = (value: string | null) => {
        if (!activeModal || activeModal.kind !== "prompt") return;
        if (value !== null && activeModal.options.required && value.trim() === "") {
            setPromptError(activeModal.options.requiredMessage ?? "Este campo es obligatorio.");
            return;
        }
        activeModal.resolve(value);
        setActiveModal(null);
        setPromptError(null);
    };

    const closeAlert = () => {
        if (!activeModal || activeModal.kind !== "alert") return;
        activeModal.resolve();
        setActiveModal(null);
    };

    const api = useMemo<ModalApi>(() => ({ confirm, prompt, alert }), [confirm, prompt, alert]);

    return (
        <ModalContext.Provider value={api}>
            {children}

            <Dialog
                open={activeModal !== null}
                disablePortal={false}
                onClose={() => {
                    if (!activeModal) return;
                    if (activeModal.kind === "confirm") closeConfirm(false);
                    if (activeModal.kind === "prompt") closePrompt(null);
                    if (activeModal.kind === "alert") closeAlert();
                }}
                sx={{ zIndex: (theme) => theme.zIndex.modal + 10 }}
                slotProps={{
                    backdrop: {
                        sx: {
                            zIndex: -1,
                            pointerEvents: "auto",
                        },
                    },
                }}
            >
                {activeModal?.kind === "confirm" && (
                    <>
                        <DialogTitle>{activeModal.options.title}</DialogTitle>
                        <DialogContent>
                            <Typography>{activeModal.options.message}</Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => closeConfirm(false)}>
                                {activeModal.options.cancelText ?? "Cancelar"}
                            </Button>
                            <Button variant="contained" onClick={() => closeConfirm(true)}>
                                {activeModal.options.confirmText ?? "Confirmar"}
                            </Button>
                        </DialogActions>
                    </>
                )}

                {activeModal?.kind === "prompt" && (
                    <>
                        <DialogTitle>{activeModal.options.title}</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                fullWidth
                                margin="dense"
                                label={activeModal.options.label}
                                value={promptValue}
                                onChange={(e) => {
                                    setPromptValue(e.target.value);
                                    if (promptError) setPromptError(null);
                                }}
                                error={Boolean(promptError)}
                                helperText={promptError ?? " "}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => closePrompt(null)}>
                                {activeModal.options.cancelText ?? "Cancelar"}
                            </Button>
                            <Button variant="contained" onClick={() => closePrompt(promptValue)}>
                                {activeModal.options.confirmText ?? "Aceptar"}
                            </Button>
                        </DialogActions>
                    </>
                )}

                {activeModal?.kind === "alert" && (
                    <>
                        <DialogTitle>{activeModal.options.title}</DialogTitle>
                        <DialogContent>
                            <Typography>{activeModal.options.message}</Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="contained" onClick={closeAlert}>
                                {activeModal.options.closeText ?? "Cerrar"}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </ModalContext.Provider>
    );
};

export const useModal = (): ModalApi => {
    const ctx = useContext(ModalContext);
    if (!ctx) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return ctx;
};
