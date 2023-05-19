import React, { useEffect, useState } from 'react';
import LeftDrawer from '@/components/LeftDrawer';
import Header from '@/components/Header';
import AlertsSnackbar from '@/components/AlertsSnackbar';
import AlertsDialog from '@/components/AlertsDialog';
import { Box, Typography, Button, Backdrop, CircularProgress } from '@mui/material';
import { PublicAccount, TransactionStatus } from 'symbol-sdk';
import useSssInit from '@/hooks/useSssInit';
import { networkType } from '@/consts/blockchainProperty';
import { sendMessageWithSSS } from '@/utils/sendMessageWithSSS';

function Page7(): JSX.Element {
  //共通設定
  const [progress, setProgress] = useState<boolean>(false); //ローディングの設定
  const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false); //LeftDrawerの設定
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false); //AlertsSnackbarの設定
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error'); //AlertsSnackbarの設定
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); //AlertsSnackbarの設定
  const [dialogTitle, setDialogTitle] = useState<string>(''); //AlertsDialogの設定(共通)
  const [dialogMessage, setDialogMessage] = useState<string>(''); //AlertsDialogの設定(共通)

  //SSS共通設定
  const { clientPublicKey,sssState } = useSssInit();
  const [clientAddress, setClientAddress] = useState<string>('');
  useEffect(() => {
    if(sssState === 'ACTIVE'){
      const clientPublicAccount = PublicAccount.createFromPublicKey(
        clientPublicKey,
        networkType
      )  
      setClientAddress(clientPublicAccount.address.plain())
    }
  }, [clientPublicKey, sssState]);

  //ページ個別設定
  const [hash, setHash] = useState<string>('');
  const [openDialogSendMessage, setOpenDialogSendMessage] = useState<boolean>(false); //AlertsDialogの設定(個別)
  const handleAgreeClickSendMessage = async () => {
    try {
      setProgress(true);
      const transactionStatus: TransactionStatus | undefined = await sendMessageWithSSS(clientAddress);
      if (transactionStatus === undefined) {
        setSnackbarSeverity('error');
        setSnackbarMessage('NODEの接続に失敗しました');
        setOpenSnackbar(true);
      } else if (transactionStatus.code === 'Success') {
        setHash(transactionStatus.hash);
        setSnackbarSeverity('success');
        setSnackbarMessage(`${transactionStatus.group} TXを検知しました`);
        setOpenSnackbar(true);
      } else {
        setSnackbarSeverity('error');
        setSnackbarMessage(`TXに失敗しました ${transactionStatus.code}`);
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setProgress(false);
    }
  };
  return (
    <>
      <Header setOpenLeftDrawer={setOpenLeftDrawer} />
      <LeftDrawer openLeftDrawer={openLeftDrawer} setOpenLeftDrawer={setOpenLeftDrawer} />
      <AlertsSnackbar
        openSnackbar={openSnackbar}
        setOpenSnackbar={setOpenSnackbar}
        vertical={'bottom'}
        snackbarSeverity={snackbarSeverity}
        snackbarMessage={snackbarMessage}
      />
      <AlertsDialog
        openDialog={openDialogSendMessage}
        setOpenDialog={setOpenDialogSendMessage}
        handleAgreeClick={() => {
          handleAgreeClickSendMessage();
          setOpenDialogSendMessage(false);
        }}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
      />
      {progress ? (
        <Backdrop open={progress}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <Box
          sx={{ p: 3 }}
          display='flex'
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
        >
          <Typography component='div' variant='h6' sx={{ mt: 5, mb: 1 }}>
            SSSで秘密鍵を使った認証
          </Typography>
          <Button
            color='primary'
            variant='contained'
            onClick={() => {
              setDialogTitle('メッセージ送信');
              setDialogMessage('クライアントから管理者へメッセージを送信しますか？');
              setOpenDialogSendMessage(true);
            }}
          >
            認証開始
          </Button>
        </Box>
      )}
    </>
  );
}
export default Page7;
