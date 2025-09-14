const { createEditor, Transforms } = require('slate');
const { transform, compose, invert } = require('slate-ot');

const slateOt = {
    name: 'slate-ot',
    uri: 'http://example.com/types/slate-ot/v1',

    create: function (initialData) {
        console.log('create', initialData);
        return initialData;
    },

    apply: function (snapshot, op) {
        console.log('apply', snapshot, op);
        const editor = createEditor();
        editor.children = snapshot.content;

        if (op.slateOp) {
            console.log('Applying slate op:', op.slateOp);
            Transforms.apply(editor, op.slateOp);
        }
        
        return { ...snapshot, content: editor.children };
    },

    transform: function (op1, op2, side) {
        console.log('transform', op1, op2, side);
        return transform(op1, op2, side);
    },

    compose: function (op1, op2) {
        console.log('compose', op1, op2);
        return compose(op1, op2);
    },

    invert: function (op) {
        console.log('invert', op);
        return invert(op);
    },
};

module.exports = slateOt;