
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { createEditor, Transforms, Editor, Element as SlateElement } from "slate";
import { Slate, Editable, withReact, useSlate } from "slate-react";
import { documentService } from "./api/documentService";
import { socketService } from "./services/socketService";
import sharedb from 'sharedb/lib/client';
import { v4 as uuidv4 } from 'uuid';


const DEFAULT_VALUE = [
    {
        type: "paragraph",
        children: [{ text: "" }],
    },
];

// Helper function to convert Slate operations to ShareDB operations
const toShareDB = (slateOps) => {
    return slateOps.map(op => {
        return { p: ['content'], slateOp: op };
    });
};


// Helper function to convert ShareDB operations to Slate operations
const toSlate = (shareDBOps) => {
    return shareDBOps.map(op => {
        if (op.slateOp) {
            return op.slateOp;
        }
        return null;
    }).filter(Boolean);
};



export default function DocsMVP({ documentId: propDocumentId, onBackToList }) {
    const editor = useMemo(() => withShortcuts(withReact(createEditor())), []);
    const [title, setTitle] = useState("");
    const [value, setValue] = useState(null);
    const [savedAt, setSavedAt] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [documentId, setDocumentId] = useState(propDocumentId);
    const [isLoading, setIsLoading] = useState(true);
    const [saveError, setSaveError] = useState(null);

    const shareDBDoc = useRef(null); 
    const isRemote = useRef(false);

    useEffect(() => {
        // If there's no document ID passed in, we don't need to do anything.
        // (You can add logic here to create a *new* document if needed).
        if (!propDocumentId) {
            const createNewDocument = async () => {
                try {
                    const newDoc = await documentService.createDocument("Untitled Document", DEFAULT_VALUE);
                    setDocumentId(newDoc._id);
                } catch (error) {
                    console.error("Failed to create new document:", error);
                    // Handle error appropriately
                }
            };
            createNewDocument();
            return;
        }
    
        // --- Start loading sequence ---
        setIsLoading(true);
    
        // 1. Establish the WebSocket connection for this document
        const connection = socketService.connect(propDocumentId);
        shareDBDoc.current = connection.get('documents', propDocumentId);
    
        // 2. Subscribe to the document. This is the SINGLE SOURCE OF TRUTH.
        shareDBDoc.current.subscribe(function (err) {
            if (err) {
                console.error('Failed to subscribe to document:', err);
                setIsLoading(false);
                setValue(DEFAULT_VALUE);
                setTitle("Error Loading Document");
                // Optionally set an error state to show in the UI
                return;
            }
            
            // 3. Once subscribed, the data is available. The server middleware has
            // already cleaned it, so we can trust it completely.
            const docData = shareDBDoc.current.data;
            setTitle(docData.title);
            setValue(docData.content);
            
            // 4. We now have valid data, so we can stop loading and show the editor.
            setIsLoading(false);

        });
        
    
        // 5. Set up the listener for remote operations from other users.
        shareDBDoc.current.on('op', function (op, source) {
            // The `source` flag is true if the op originated from this client.
            // We only want to apply ops from other clients.
            if (source) return;
    
            isRemote.current = true;
            const slateOps = toSlate(Array.isArray(op) ? op : [op]);
            // Apply each incoming operation to the Slate editor.
            slateOps.forEach(slateOp => editor.apply(slateOp));
            isRemote.current = false;
        });
    
        // 6. Return a cleanup function. This runs when the component unmounts.
        return () => {
            if (shareDBDoc.current) {
                // Gracefully destroy the ShareDB document subscription to prevent memory leaks.
                shareDBDoc.current.destroy();
            }
            // Disconnect the WebSocket.
            socketService.disconnect();
        };
    
        // This effect should re-run only when the document ID prop changes.
    }, [propDocumentId, editor]);

    
    const handleTitleChange = (newTitle) => {
        setTitle(newTitle);
        setIsDirty(true);
    };

    // Cloud autosave for title
    useEffect(() => {
        if (!isDirty || isLoading || !documentId) {
            return;
        }

        const timer = setTimeout(async () => {
            try {
                await documentService.updateDocument(documentId, title, value);
                setIsDirty(false);
                setSavedAt(new Date());
            } catch (error) {
                setSaveError('Failed to save title');
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [title, isDirty, documentId, isLoading, value]);


    const renderElement = useCallback((p) => <Element {...p} />, []);
    const renderLeaf = useCallback((p) => <Leaf {...p} />, []);

    if (isLoading || !value) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            {/* ... Your App Bar and other UI ... */}
            {/* Example of title input */}
            <input value={title} onChange={(e) => handleTitleChange(e.target.value)} />
            
            <Slate
                editor={editor}
                key={propDocumentId || 'new-document'}
                initialValue={value}
                onChange={(newValue) => {
                    setValue(newValue);
                    if (isRemote.current) return;
                    
                    const ops = toShareDB(editor.operations);
                    if (ops.length > 0 && shareDBDoc.current) {
                        shareDBDoc.current.submitOp(ops);
                    }
                }}
            >
                {/* ... Your Toolbar JSX ... */}

                <div className="max-w-2xl mx-auto p-8">
                    <Editable
                        renderElement={renderElement} // You need to define these renderers
                        renderLeaf={renderLeaf}
                        placeholder="Start typing..."
                        className="bg-white p-12 shadow-lg rounded-lg"
                    />
                </div>
            </Slate>
        </div>
    );
}

/* ========= Toolbar ========= */
function ToolbarButton({ onMouseDown, active, label, kbd }) {
    return (
        <button
            type="button"
            onMouseDown={onMouseDown}
            className={`px-3 py-2 rounded-2xl text-sm border transition shadow-sm mr-2 ${active ? "bg-gray-200 border-gray-300" : "bg-white hover:bg-gray-50 border-gray-200"
                }`}
            title={kbd ? `${label} (${kbd})` : label}
            aria-pressed={active}
        >
            {label}
            {kbd ? <span className="ml-2 text-xs text-gray-500">{kbd}</span> : null}
        </button>
    );
}

function isMarkActive(editor, mark) {
    const marks = Editor.marks(editor);
    return marks ? !!marks[mark] : false;
}
function toggleMark(editor, mark) {
    const active = isMarkActive(editor, mark);
    if (active) Editor.removeMark(editor, mark);
    else Editor.addMark(editor, mark, true);
}

function MarkButton({ format, label }) {
    const editor = useSlate();
    const active = isMarkActive(editor, format);
    const kbd =
        format === "bold" ? "Ctrl+B" : format === "italic" ? "Ctrl+I" : "Ctrl+U";
    return (
        <ToolbarButton
            onMouseDown={(e) => {
                e.preventDefault();
                toggleMark(editor, format);
            }}
            active={active}
            label={label}
            kbd={kbd}
        />
    );
}

const BLOCK_TYPES = [
    { label: "Normal text", type: "paragraph" },
    { label: "Heading 1", type: "heading", level: 1 },
    { label: "Heading 2", type: "heading", level: 2 },
    { label: "Heading 3", type: "heading", level: 3 },
];

function isBlockActive(editor, type, level) {
    const [match] = Array.from(
        Editor.nodes(editor, {
            at: editor.selection ?? undefined,
            match: (n) =>
                SlateElement.isElement(n) &&
                n.type === type &&
                (type !== "heading" || n.level === level),
        })
    );
    return !!match;
}

function setBlockType(editor, type, level) {
    Transforms.setNodes(editor, type === "heading" ? { type, level } : { type });
}

function BlockDropdown() {
    const editor = useSlate();
    const current = useMemo(() => {
        for (const opt of BLOCK_TYPES) {
            if (isBlockActive(editor, opt.type, opt.level)) return opt;
        }
        return BLOCK_TYPES[0];
    }, [editor]);

    return (
        <select
            className="px-3 py-2 rounded-2xl text-sm border bg-white shadow-sm mr-2"
            value={`${current.type}:${current.level ?? ""}`}
            onChange={(e) => {
                const [type, lvl] = e.target.value.split(":");
                setBlockType(editor, type, lvl ? parseInt(lvl, 10) : undefined);
            }}
        >
            {BLOCK_TYPES.map((opt) => (
                <option
                    key={`${opt.type}:${opt.level ?? ""}`}
                    value={`${opt.type}:${opt.level ?? ""}`}
                >
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

/* ========= Renderers ========= */
function Element({ attributes, children, element }) {
    switch (element.type) {
        case "heading": {
            const lvl = element.level || 1;
            const Tag = `h${lvl}`;
            return (
                <Tag
                    {...attributes}
                    className={`font-semibold ${lvl === 1 ? "text-3xl" : lvl === 2 ? "text-2xl" : "text-xl"
                        }`}
                >
                    {children}
                </Tag>
            );
        }
        default:
            return (
                <p {...attributes} className="leading-7">
                    {children}
                </p>
            );
    }
}
function Leaf({ attributes, children, leaf }) {
    if (leaf.bold) children = <strong>{children}</strong>;
    if (leaf.italic) children = <em>{children}</em>;
    if (leaf.underline) children = <u>{children}</u>;
    return <span {...attributes}>{children}</span>;
}

/* ========= Shortcuts ========= */
function withShortcuts(editor) {
    const origOnKeyDown = editor.onKeyDown;
    editor.onKeyDown = (e) => {
        if (e && (e.ctrlKey || e.metaKey)) {
            const key = String(e.key).toLowerCase();
            if (key === "b") {
                e.preventDefault();
                toggleMark(editor, "bold");
                return;
            }
            if (key === "i") {
                e.preventDefault();
                toggleMark(editor, "italic");
                return;
            }
            if (key === "u") {
                e.preventDefault();
                toggleMark(editor, "underline");
                return;
            }
        }
        if (origOnKeyDown) origOnKeyDown(e);
    };
    return editor;
}
''