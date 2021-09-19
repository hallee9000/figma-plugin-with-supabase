export async function init() {
    // At first, check if user is logged in
    const auth = await figma.clientStorage.getAsync('supabase.auth');
    figma.ui.postMessage({
        type: 'bg:get-auth',
        message: {auth},
    });
}

// Export image
export const exportImage = async (node) => {
    try {
        const imageData = await node.exportAsync({
            format: 'PNG',
            constraint: {
                type: 'SCALE',
                value: 2,
            },
        });
        return imageData;
    } catch (err) {
        console.error(err);
    }
};
