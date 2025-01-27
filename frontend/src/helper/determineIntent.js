export default function determineIntent(isFirstView, activeStep) {

    if (!isFirstView && activeStep == 1) {
        return 'update';
    } else {
        return 'create';
    }
}