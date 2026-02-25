import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";

interface ShareModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    text: string;
    url: string;
    onCopyLink: () => Promise<void>;
}

const ShareModal: React.FC<ShareModalProps> = ({
    open,
    onClose,
    title,
    text,
    url,
    onCopyLink,
}) => {
    const openShareUrl = (shareUrl: string) => {
        window.open(shareUrl, "_blank", "noopener,noreferrer");
    };

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Compartir {title}</DialogTitle>
            <DialogContent>
                <Stack spacing={1.5} sx={{ mt: 1, minWidth: 260 }}>
                    <Button variant="outlined" onClick={() => openShareUrl(whatsappUrl)}>
                        WhatsApp
                    </Button>
                    <Button variant="outlined" onClick={() => openShareUrl(xUrl)}>
                        X (Twitter)
                    </Button>
                    <Button variant="outlined" onClick={() => openShareUrl(facebookUrl)}>
                        Facebook
                    </Button>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            await onCopyLink();
                            onClose();
                        }}
                    >
                        Copiar enlace
                    </Button>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShareModal;
