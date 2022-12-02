import React from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import FaceChatImage from './games/gameImages/FaceChatImage.jpg';
import TicTacToeImage from './games/gameImages/TicTacToeImage.png';

const Games = () => {

    const navigate = useNavigate();  

    const ImageButton = styled(ButtonBase)(({ theme }) => ({
        position: 'relative',
        height: 200,
        [theme.breakpoints.down('sm')]: {
          width: '100% !important', // Overrides inline-style
          height: 100,
        },
        '&:hover, &.Mui-focusVisible': {
          zIndex: 1,
          '& .MuiImageBackdrop-root': {
            opacity: 0.15,
          },
          '& .MuiImageMarked-root': {
            opacity: 0,
          },
          '& .MuiTypography-root': {
            border: '4px solid currentColor',
          },
        },
    }));
      
    const ImageSrc = styled('span')({
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
    });
    
    const Image = styled('span')(({ theme }) => ({
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.common.white,
    }));
    
    const ImageBackdrop = styled('span')(({ theme }) => ({
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: theme.palette.common.black,
        opacity: 0.4,
        transition: theme.transitions.create('opacity'),
    }));
    
    const ImageMarked = styled('span')(({ theme }) => ({
        height: 3,
        width: 18,
        backgroundColor: theme.palette.common.white,
        position: 'absolute',
        bottom: -2,
        left: 'calc(50% - 9px)',
        transition: theme.transitions.create('opacity'),
    }));

    const images = [
        {
            url: FaceChatImage,
            title: 'FaceChat',
            width: '50%',
            redirect: 'facechat',
        },
        {
            url: TicTacToeImage,
            title: 'Tic Tac Toe',
            width: '50%',
            redirect: 'tictactoe',
        },
        {
            url: TicTacToeImage,
            title: 'Poker',
            width: '50%',
            redirect: 'poker',
        },
        {
            url: TicTacToeImage,
            title: '1v1 Template',
            width: '50%',
            redirect: 'template',
        },
        {
            url: TicTacToeImage,
            title: 'Multi Peer Template',
            width: '50%',
            redirect: 'multi-peer-template',
        },
        {
            url: TicTacToeImage,
            title: 'Multi Peer Template Rewrite',
            width: '50%',
            redirect: 'multi-peer-template-rewrite',
        },
    ];

    return (
        <div
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                'padding-left': '3em',
                'padding-right': '3em',
                'padding-bottom': '3em',
            }}
        >
            <h1 style={{textAlign: 'center'}}>Games</h1>
            <br/>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', minWidth: 300, width: '100%' }}>
                {images.map((image) => (
                    <ImageButton
                        focusRipple
                        key={image.title}
                        style={{
                            width: image.width,
                        }}
                        onClick={() => navigate("/" + image.redirect)}
                    >
                        <ImageSrc style={{ backgroundImage: `url(${image.url})` }} />
                        <ImageBackdrop className="MuiImageBackdrop-root" />
                        <Image>
                            <Typography
                                component="span"
                                variant="subtitle1"
                                color="inherit"
                                sx={{
                                    position: 'relative',
                                    p: 4,
                                    pt: 2,
                                    pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
                                }}
                            >
                                {image.title}
                                <ImageMarked className="MuiImageMarked-root" />
                            </Typography>
                        </Image>
                    </ImageButton>
                ))}
            </Box>
        </div>
    );
};

export default Games;
