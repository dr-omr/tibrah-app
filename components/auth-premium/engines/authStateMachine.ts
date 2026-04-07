export type AuthStep = 
    | 'IDENTIFY' 
    | 'BIOMETRIC_PROMPT' 
    | 'VERIFY_PASSWORD' 
    | 'VERIFY_OTP'
    | 'ONBOARD_BASIC' 
    | 'ONBOARD_MEDICAL_INTENT' 
    | 'COMPLETE';

export type AuthContextState = {
    email: string;
    flowType: 'LOGIN' | 'REGISTER' | 'UNIFY';
    isBiometricAvailable: boolean;
    tempToken: string | null;
    medicalIntent: string[];
};

export type AuthEvent =
    | { type: 'SUBMIT_EMAIL'; payload: { email: string; isNewUser: boolean } }
    | { type: 'BIOMETRIC_SUCCESS' }
    | { type: 'BIOMETRIC_FAIL' }
    | { type: 'SUBMIT_PASSWORD_LOGIN' }
    | { type: 'SUBMIT_NEW_PASSWORD' }
    | { type: 'SUBMIT_ONBOARD_BASIC'; payload: { name: string } }
    | { type: 'SUBMIT_MEDICAL_INTENT'; payload: { intents: string[] } }
    | { type: 'RESET' };

export function authStateReducer(
    state: { step: AuthStep; context: AuthContextState },
    event: AuthEvent
): { step: AuthStep; context: AuthContextState } {
    switch (state.step) {
        case 'IDENTIFY':
            if (event.type === 'SUBMIT_EMAIL') {
                const isRegister = event.payload.isNewUser;
                return {
                    step: state.context.isBiometricAvailable && !isRegister ? 'BIOMETRIC_PROMPT' : (isRegister ? 'ONBOARD_BASIC' : 'VERIFY_PASSWORD'),
                    context: { ...state.context, email: event.payload.email, flowType: isRegister ? 'REGISTER' : 'LOGIN' },
                };
            }
            break;

        case 'BIOMETRIC_PROMPT':
            if (event.type === 'BIOMETRIC_SUCCESS') return { ...state, step: 'COMPLETE' };
            if (event.type === 'BIOMETRIC_FAIL') return { ...state, step: 'VERIFY_PASSWORD' };
            break;

        case 'ONBOARD_BASIC':
            if (event.type === 'SUBMIT_ONBOARD_BASIC') {
                return { ...state, step: 'VERIFY_PASSWORD' }; // Setup password
            }
            break;

        case 'VERIFY_PASSWORD':
            if (event.type === 'SUBMIT_NEW_PASSWORD') {
                return { ...state, step: 'ONBOARD_MEDICAL_INTENT' };
            }
            if (event.type === 'SUBMIT_PASSWORD_LOGIN') {
                return { ...state, step: 'COMPLETE' };
            }
            break;

        case 'ONBOARD_MEDICAL_INTENT':
            if (event.type === 'SUBMIT_MEDICAL_INTENT') {
                return { 
                    step: 'COMPLETE',
                    context: { ...state.context, medicalIntent: event.payload.intents }
                };
            }
            break;

        default:
            break;
    }

    if (event.type === 'RESET') {
        return {
            step: 'IDENTIFY',
            context: { email: '', flowType: 'LOGIN', isBiometricAvailable: state.context.isBiometricAvailable, tempToken: null, medicalIntent: [] }
        };
    }

    return state;
}
