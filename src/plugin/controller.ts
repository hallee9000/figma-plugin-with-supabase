import {exportImage, init} from './helper';

figma.showUI(__html__, {
    width: 280,
    height: 400,
});

init();

figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
        case 'ui:set-auth':
            await figma.clientStorage.setAsync('supabase.auth', msg.auth);
            break;

        case 'ui:clear-auth':
            await figma.clientStorage.setAsync('supabase.auth', void 0);
            break;

        case 'ui:get-avatar':
            const avatar = figma.currentPage.selection[0];
            if (avatar) {
                const avatarData = await exportImage(avatar);
                figma.ui.postMessage({
                    type: 'bg:get-avatar',
                    message: {avatarData},
                });
            } else {
                figma.notify('Please select at least one element.');
            }
            break;

        default:
            break;
    }

    // figma.closePlugin();
};
