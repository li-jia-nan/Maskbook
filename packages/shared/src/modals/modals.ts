import { SingletonModal } from '@masknet/shared-base'
import type { SelectProviderModalOpenProps } from './SelectProviderModal/index.js'
import type { WalletConnectQRCodeOpenProps } from './WalletConnectQRCodeModal/index.js'
import type { WalletRiskWarningModalOpenProps } from './WalletRiskWarningModal/index.js'
import type { ConnectWalletModalOpenProps } from './ConnectWalletModal/index.js'
import type { LeavePageConfirmModalOpenProps } from './LeavePageConfirmModal/index.js'
import type { ApplicationBoardModalOpenProps } from './ApplicationBoardModal/index.js'
import type { GasSettingModalOpenOrCloseProps } from './GasSettingModal/index.js'
import type { WalletStatusModalOpenProps } from './WalletStatusModal/index.js'
import type { TransactionSnackbarOpenProps } from './TransactionSnackbar/index.js'
import type { ConfirmDialogOpenProps } from './Confirm/index.js'

export const WalletConnectQRCodeModal = new SingletonModal<WalletConnectQRCodeOpenProps>()
export const SelectProviderModal = new SingletonModal<SelectProviderModalOpenProps>()
export const WalletStatusModal = new SingletonModal<WalletStatusModalOpenProps>()
export const WalletRiskWarningModal = new SingletonModal<WalletRiskWarningModalOpenProps>()
export const ConnectWalletModal = new SingletonModal<ConnectWalletModalOpenProps>()
export const LeavePageConfirmModal = new SingletonModal<LeavePageConfirmModalOpenProps>()
export const ApplicationBoardModal = new SingletonModal<ApplicationBoardModalOpenProps>()
export const GasSettingModal = new SingletonModal<GasSettingModalOpenOrCloseProps, GasSettingModalOpenOrCloseProps>()
export const TransactionSnackbar = new SingletonModal<TransactionSnackbarOpenProps>()
export const ConfirmModal = new SingletonModal<ConfirmDialogOpenProps>()
