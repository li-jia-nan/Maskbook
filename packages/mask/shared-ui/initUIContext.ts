import { createSubscriptionFromAsync, DashboardRoutes, MaskMessages } from '@masknet/shared-base'
import Services from '#services'
import { __setUIContext__ } from '@masknet/plugin-infra/content-script'

export const allPersonas = createSubscriptionFromAsync(
    () => Services.Identity.queryOwnedPersonaInformation(true),
    [],
    (x) => {
        const clearCurrentPersonaIdentifier = MaskMessages.events.currentPersonaIdentifier.on(x)
        const clearPersonasChanged = MaskMessages.events.personasChanged.on(x)

        return () => {
            clearCurrentPersonaIdentifier()
            clearPersonasChanged()
        }
    },
)
export const currentPersona = createSubscriptionFromAsync(
    Services.Settings.getCurrentPersonaIdentifier,
    undefined,
    MaskMessages.events.currentPersonaIdentifier.on,
)

export function setupUIContext() {
    __setUIContext__({
        allPersonas,
        currentPersona,
        queryPersonaAvatar: Services.Identity.getPersonaAvatar,
        querySocialIdentity: Services.Identity.querySocialIdentity,
        fetchJSON: Services.Helper.fetchJSON,
        queryPersonaByProfile: Services.Identity.queryPersonaByProfile,
        openDashboard: Services.Helper.openDashboard,
        openPopupWindow: Services.Helper.openPopupWindow,
        signWithPersona: (a, b, c, d) => Services.Identity.signWithPersona(a, b, c, location.origin, d),
        hasPaymentPassword: Services.Wallet.hasPassword,
        createPersona: () => Services.Helper.openDashboard(DashboardRoutes.SignUpPersona),
        attachProfile: Services.Identity.attachProfile,
        setCurrentPersonaIdentifier: Services.Settings.setCurrentPersonaIdentifier,
        setPluginMinimalModeEnabled: Services.Settings.setPluginMinimalModeEnabled,
        hasHostPermission: Services.Helper.hasHostPermission,
        requestHostPermission: Services.Helper.requestHostPermission,
    })
}
