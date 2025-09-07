import { Operation } from 'slate';

/**
 * Operational Transformation utilities for Slate.js
 * Handles concurrent editing operations to maintain document consistency
 */

/**
 * Transform an operation against another operation that happened concurrently
 * This ensures that operations can be applied in any order and produce the same result
 */
export function transformOperation(op1, op2, priority = 'left') {
  // If operations are on different paths, they don't conflict
  if (!pathsIntersect(op1.path, op2.path)) {
    return op1;
  }

  // Handle different operation types
  if (op1.type === 'insert_text' && op2.type === 'insert_text') {
    return transformInsertText(op1, op2, priority);
  }

  if (op1.type === 'remove_text' && op2.type === 'remove_text') {
    return transformRemoveText(op1, op2, priority);
  }

  if (op1.type === 'insert_text' && op2.type === 'remove_text') {
    return transformInsertRemove(op1, op2);
  }

  if (op1.type === 'remove_text' && op2.type === 'insert_text') {
    return transformRemoveInsert(op1, op2);
  }

  if (op1.type === 'insert_node' && op2.type === 'insert_node') {
    return transformInsertNode(op1, op2, priority);
  }

  if (op1.type === 'remove_node' && op2.type === 'remove_node') {
    return transformRemoveNode(op1, op2, priority);
  }

  // For other cases, return the original operation
  return op1;
}

/**
 * Transform insert_text operations
 */
function transformInsertText(op1, op2, priority) {
  if (!pathEquals(op1.path, op2.path)) {
    return op1;
  }

  // If inserting at the same position, use priority to determine order
  if (op1.offset === op2.offset) {
    if (priority === 'right') {
      return {
        ...op1,
        offset: op1.offset + op2.text.length
      };
    }
    return op1; // 'left' priority - keep original offset
  }

  // If op2 inserts before op1, adjust op1's offset
  if (op2.offset <= op1.offset) {
    return {
      ...op1,
      offset: op1.offset + op2.text.length
    };
  }

  return op1;
}

/**
 * Transform remove_text operations
 */
function transformRemoveText(op1, op2) {
  if (!pathEquals(op1.path, op2.path)) {
    return op1;
  }

  const op1End = op1.offset + op1.text.length;
  const op2End = op2.offset + op2.text.length;

  // If removals don't overlap
  if (op2End <= op1.offset) {
    // op2 removes before op1, shift op1 left
    return {
      ...op1,
      offset: op1.offset - op2.text.length
    };
  }

  if (op1End <= op2.offset) {
    // op1 removes before op2, no change needed
    return op1;
  }

  // Removals overlap - this is complex, for now return null to indicate conflict
  console.warn('Overlapping remove operations detected', { op1, op2 });
  return null;
}

/**
 * Transform insert_text against remove_text
 */
function transformInsertRemove(insertOp, removeOp) {
  if (!pathEquals(insertOp.path, removeOp.path)) {
    return insertOp;
  }

  const removeEnd = removeOp.offset + removeOp.text.length;

  // If remove happens after insert, no change needed
  if (insertOp.offset <= removeOp.offset) {
    return insertOp;
  }

  // If insert happens after remove, shift insert left
  if (insertOp.offset >= removeEnd) {
    return {
      ...insertOp,
      offset: insertOp.offset - removeOp.text.length
    };
  }

  // Insert happens inside remove range - move to start of remove
  return {
    ...insertOp,
    offset: removeOp.offset
  };
}

/**
 * Transform remove_text against insert_text
 */
function transformRemoveInsert(removeOp, insertOp) {
  if (!pathEquals(removeOp.path, insertOp.path)) {
    return removeOp;
  }

  // If insert happens before remove, shift remove right
  if (insertOp.offset <= removeOp.offset) {
    return {
      ...removeOp,
      offset: removeOp.offset + insertOp.text.length
    };
  }

  // If insert happens after remove, no change needed
  const removeEnd = removeOp.offset + removeOp.text.length;
  if (insertOp.offset >= removeEnd) {
    return removeOp;
  }

  // Insert happens inside remove range - split remove operation
  // For simplicity, we'll extend the remove to include the insert
  return {
    ...removeOp,
    text: removeOp.text + insertOp.text
  };
}

/**
 * Transform insert_node operations
 */
function transformInsertNode(op1, op2, priority) {
  const path1 = op1.path;
  const path2 = op2.path;

  // If same path and position, use priority
  if (pathEquals(path1, path2)) {
    if (priority === 'right') {
      return {
        ...op1,
        path: [...path1.slice(0, -1), path1[path1.length - 1] + 1]
      };
    }
    return op1;
  }

  // If op2 inserts before op1 at same level, adjust op1's path
  if (pathEquals(path1.slice(0, -1), path2.slice(0, -1)) && 
      path2[path2.length - 1] <= path1[path1.length - 1]) {
    return {
      ...op1,
      path: [...path1.slice(0, -1), path1[path1.length - 1] + 1]
    };
  }

  return op1;
}

/**
 * Transform remove_node operations
 */
function transformRemoveNode(op1, op2) {
  const path1 = op1.path;
  const path2 = op2.path;

  // If trying to remove the same node
  if (pathEquals(path1, path2)) {
    return null; // Operation is no longer valid
  }

  // If op2 removes before op1 at same level, adjust op1's path
  if (pathEquals(path1.slice(0, -1), path2.slice(0, -1)) && 
      path2[path2.length - 1] < path1[path1.length - 1]) {
    return {
      ...op1,
      path: [...path1.slice(0, -1), path1[path1.length - 1] - 1]
    };
  }

  return op1;
}

/**
 * Check if two paths are equal
 */
function pathEquals(path1, path2) {
  if (path1.length !== path2.length) return false;
  return path1.every((val, idx) => val === path2[idx]);
}

/**
 * Check if two paths intersect (one is ancestor of the other)
 */
function pathsIntersect(path1, path2) {
  const minLength = Math.min(path1.length, path2.length);
  for (let i = 0; i < minLength; i++) {
    if (path1[i] !== path2[i]) return false;
  }
  return true;
}

/**
 * Apply a list of operations with operational transformation
 */
export function applyOperationsWithOT(editor, operations, localOperations = []) {
  // Transform remote operations against local operations that haven't been acknowledged
  const transformedOperations = operations.reduce((acc, remoteOp) => {
    let transformedOp = remoteOp;
    
    // Transform against all local operations
    for (const localOp of localOperations) {
      transformedOp = transformOperation(transformedOp, localOp, 'right');
      if (!transformedOp) break; // Operation was cancelled
    }
    
    if (transformedOp) {
      acc.push(transformedOp);
    }
    
    return acc;
  }, []);

  // Apply transformed operations to the editor
  editor.apply(transformedOperations);
  
  return transformedOperations;
}

/**
 * Create operation data structure for sending over network
 */
export function serializeOperation(operation) {
  return {
    type: operation.type,
    path: operation.path,
    offset: operation.offset,
    text: operation.text,
    node: operation.node,
    properties: operation.properties,
    newProperties: operation.newProperties,
    timestamp: Date.now()
  };
}

/**
 * Deserialize operation from network data
 */
export function deserializeOperation(data) {
  return {
    type: data.type,
    path: data.path,
    offset: data.offset,
    text: data.text,
    node: data.node,
    properties: data.properties,
    newProperties: data.newProperties
  };
}