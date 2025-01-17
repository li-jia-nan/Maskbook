import { CrossIsolationMessages, LockStatus, currentMaskWalletLockStatusSettings } from '@masknet/shared-base'
import { getAutoLockerDuration } from './database/locker.js'
import * as password from './password.js'
import { hmr } from '../../../../../utils-pure/hmr.js'

export async function isLocked() {
    return (await password.hasPassword()) && !(await password.hasVerifiedPassword())
}

export async function lockWallet() {
    password.clearPassword()
    currentMaskWalletLockStatusSettings.value = LockStatus.LOCKED
    CrossIsolationMessages.events.walletLockStatusUpdated.sendToAll(true)
}

export async function unlockWallet(unverifiedPassword: string) {
    if (!isLocked()) return true
    try {
        await password.verifyPasswordRequired(unverifiedPassword)
        currentMaskWalletLockStatusSettings.value = LockStatus.UNLOCK
        CrossIsolationMessages.events.walletLockStatusUpdated.sendToAll(false)
        await setAutoLockTimer()
        return true
    } catch {
        CrossIsolationMessages.events.walletLockStatusUpdated.sendToAll(true)
        return false
    }
}

let autoLockTimer: ReturnType<typeof setTimeout> | undefined

export async function setAutoLockTimer() {
    const autoLockDuration = await getAutoLockerDuration()

    clearTimeout(autoLockTimer)

    if (autoLockDuration <= 0) return

    autoLockTimer = setTimeout(async () => {
        await lockWallet()
    }, autoLockDuration)
}

const { signal } = hmr(import.meta.webpackHot)
// Reset timer
CrossIsolationMessages.events.walletLockStatusUpdated.on(setAutoLockTimer, { signal })
