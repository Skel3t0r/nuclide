

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var getPosition = require('./getPosition');
var getRawPosition = require('./getRawPosition');

// Accuracy determines how many tokens we look for to guess the position.
var ACCURACIES = [15, 4, 1];
var WHITESPACE = '\\s*';

/**
 * Given the starting source, starting position, and the ending source this
 * function guesses where the cursor should move to.
 */
function updateCursor(startSource, startPosition, endSource) {
  for (var accuracy of ACCURACIES) {
    var result = maybeUpdateCursorWithAccuracy(startSource, startPosition, endSource, accuracy);
    if (result) {
      return result;
    }
  }
  // TODO: Guess a little better, perhaps detect line difference or something?
  return startPosition;
}

function maybeUpdateCursorWithAccuracy(startSource, startPosition, endSource, accuracy) {
  var rawStartPosition = getRawPosition(startSource, startPosition);
  var regexParts = [];
  var inWord = false;
  for (var i = rawStartPosition - 1, found = 0; i >= 0 && found < accuracy; i--) {
    var char = startSource.charAt(i);
    if (/\s/.test(char)) {
      if (regexParts[0] !== WHITESPACE) {
        regexParts.unshift(WHITESPACE);
      }
      if (inWord) {
        found++;
        inWord = false;
      }
    } else {
      // TODO: Add optional catch all at word boundaries to account for adding
      // commas in a transform. Is this even necessary?
      if (/\w/.test(char)) {
        // We are starting a word so there can be whitespace.
        if (!inWord) {
          // We don't need to add it if it's already there, or this is the
          // very first regex part.
          if (regexParts[0] !== WHITESPACE && regexParts.length > 0) {
            regexParts.unshift(WHITESPACE);
          }
        }
        inWord = true;
        regexParts.unshift(char);
      } else {
        // We are ending a word so there can be whitespace.
        if (inWord) {
          regexParts.unshift(WHITESPACE);
          found++;
          inWord = false;
        }
        var escapedChar = char.replace(/[[{()*+?.\\^$|]/g, '\\$&');
        regexParts.unshift(escapedChar + '?');
      }
    }
  }
  var regex = new RegExp(regexParts.join(''));
  var result = regex.exec(endSource);
  if (!result) {
    return null;
  }
  var rawEndPosition = result[0].length + result.index;
  return getPosition(endSource, rawEndPosition);
}

module.exports = updateCursor;
//# sourceMappingURL=data:application/json;base64,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Q1gsV0FBTyxJQUFJLENBQUM7R0FDYjtBQUNELE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUN2RCxTQUFPLFdBQVcsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7Q0FDL0M7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMiLCJmaWxlIjoidXBkYXRlQ3Vyc29yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgZ2V0UG9zaXRpb24gPSByZXF1aXJlKCcuL2dldFBvc2l0aW9uJyk7XG5jb25zdCBnZXRSYXdQb3NpdGlvbiA9IHJlcXVpcmUoJy4vZ2V0UmF3UG9zaXRpb24nKTtcblxuLy8gQWNjdXJhY3kgZGV0ZXJtaW5lcyBob3cgbWFueSB0b2tlbnMgd2UgbG9vayBmb3IgdG8gZ3Vlc3MgdGhlIHBvc2l0aW9uLlxuY29uc3QgQUNDVVJBQ0lFUyA9IFsxNSwgNCwgMV07XG5jb25zdCBXSElURVNQQUNFID0gJ1xcXFxzKic7XG5cbi8qKlxuICogR2l2ZW4gdGhlIHN0YXJ0aW5nIHNvdXJjZSwgc3RhcnRpbmcgcG9zaXRpb24sIGFuZCB0aGUgZW5kaW5nIHNvdXJjZSB0aGlzXG4gKiBmdW5jdGlvbiBndWVzc2VzIHdoZXJlIHRoZSBjdXJzb3Igc2hvdWxkIG1vdmUgdG8uXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZUN1cnNvcihcbiAgc3RhcnRTb3VyY2U6IHN0cmluZyxcbiAgc3RhcnRQb3NpdGlvbjoge3JvdzogbnVtYmVyLCBjb2x1bW46IG51bWJlcn0sXG4gIGVuZFNvdXJjZTogc3RyaW5nLFxuKToge3JvdzogbnVtYmVyLCBjb2x1bW46IG51bWJlcn0ge1xuICBmb3IgKGNvbnN0IGFjY3VyYWN5IG9mIEFDQ1VSQUNJRVMpIHtcbiAgICBjb25zdCByZXN1bHQgPSBtYXliZVVwZGF0ZUN1cnNvcldpdGhBY2N1cmFjeShcbiAgICAgIHN0YXJ0U291cmNlLFxuICAgICAgc3RhcnRQb3NpdGlvbixcbiAgICAgIGVuZFNvdXJjZSxcbiAgICAgIGFjY3VyYWN5LFxuICAgICk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cbiAgLy8gVE9ETzogR3Vlc3MgYSBsaXR0bGUgYmV0dGVyLCBwZXJoYXBzIGRldGVjdCBsaW5lIGRpZmZlcmVuY2Ugb3Igc29tZXRoaW5nP1xuICByZXR1cm4gc3RhcnRQb3NpdGlvbjtcbn1cblxuZnVuY3Rpb24gbWF5YmVVcGRhdGVDdXJzb3JXaXRoQWNjdXJhY3koXG4gIHN0YXJ0U291cmNlOiBzdHJpbmcsXG4gIHN0YXJ0UG9zaXRpb246IHtyb3c6IG51bWJlciwgY29sdW1uOiBudW1iZXJ9LFxuICBlbmRTb3VyY2U6IHN0cmluZyxcbiAgYWNjdXJhY3k6IG51bWJlcixcbik6ID97cm93OiBudW1iZXIsIGNvbHVtbjogbnVtYmVyfSB7XG4gIGNvbnN0IHJhd1N0YXJ0UG9zaXRpb24gPSBnZXRSYXdQb3NpdGlvbihzdGFydFNvdXJjZSwgc3RhcnRQb3NpdGlvbik7XG4gIGNvbnN0IHJlZ2V4UGFydHMgPSBbXTtcbiAgbGV0IGluV29yZCA9IGZhbHNlO1xuICBmb3IgKFxuICAgIGxldCBpID0gcmF3U3RhcnRQb3NpdGlvbiAtIDEsIGZvdW5kID0gMDtcbiAgICBpID49IDAgJiYgZm91bmQgPCBhY2N1cmFjeTtcbiAgICBpLS1cbiAgKSB7XG4gICAgY29uc3QgY2hhciA9IHN0YXJ0U291cmNlLmNoYXJBdChpKTtcbiAgICBpZiAoL1xccy8udGVzdChjaGFyKSkge1xuICAgICAgaWYgKHJlZ2V4UGFydHNbMF0gIT09IFdISVRFU1BBQ0UpIHtcbiAgICAgICAgcmVnZXhQYXJ0cy51bnNoaWZ0KFdISVRFU1BBQ0UpO1xuICAgICAgfVxuICAgICAgaWYgKGluV29yZCkge1xuICAgICAgICBmb3VuZCsrO1xuICAgICAgICBpbldvcmQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETzogQWRkIG9wdGlvbmFsIGNhdGNoIGFsbCBhdCB3b3JkIGJvdW5kYXJpZXMgdG8gYWNjb3VudCBmb3IgYWRkaW5nXG4gICAgICAvLyBjb21tYXMgaW4gYSB0cmFuc2Zvcm0uIElzIHRoaXMgZXZlbiBuZWNlc3Nhcnk/XG4gICAgICBpZiAoL1xcdy8udGVzdChjaGFyKSkge1xuICAgICAgICAvLyBXZSBhcmUgc3RhcnRpbmcgYSB3b3JkIHNvIHRoZXJlIGNhbiBiZSB3aGl0ZXNwYWNlLlxuICAgICAgICBpZiAoIWluV29yZCkge1xuICAgICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gYWRkIGl0IGlmIGl0J3MgYWxyZWFkeSB0aGVyZSwgb3IgdGhpcyBpcyB0aGVcbiAgICAgICAgICAvLyB2ZXJ5IGZpcnN0IHJlZ2V4IHBhcnQuXG4gICAgICAgICAgaWYgKHJlZ2V4UGFydHNbMF0gIT09IFdISVRFU1BBQ0UgJiYgcmVnZXhQYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZWdleFBhcnRzLnVuc2hpZnQoV0hJVEVTUEFDRSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGluV29yZCA9IHRydWU7XG4gICAgICAgIHJlZ2V4UGFydHMudW5zaGlmdChjaGFyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFdlIGFyZSBlbmRpbmcgYSB3b3JkIHNvIHRoZXJlIGNhbiBiZSB3aGl0ZXNwYWNlLlxuICAgICAgICBpZiAoaW5Xb3JkKSB7XG4gICAgICAgICAgcmVnZXhQYXJ0cy51bnNoaWZ0KFdISVRFU1BBQ0UpO1xuICAgICAgICAgIGZvdW5kKys7XG4gICAgICAgICAgaW5Xb3JkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXNjYXBlZENoYXIgPSBjaGFyLnJlcGxhY2UoL1tbeygpKis/LlxcXFxeJHxdL2csICdcXFxcJCYnKTtcbiAgICAgICAgcmVnZXhQYXJ0cy51bnNoaWZ0KGVzY2FwZWRDaGFyICsgJz8nKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKHJlZ2V4UGFydHMuam9pbignJykpO1xuICBjb25zdCByZXN1bHQgPSByZWdleC5leGVjKGVuZFNvdXJjZSk7XG4gIGlmICghcmVzdWx0KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgcmF3RW5kUG9zaXRpb24gPSByZXN1bHRbMF0ubGVuZ3RoICsgcmVzdWx0LmluZGV4O1xuICByZXR1cm4gZ2V0UG9zaXRpb24oZW5kU291cmNlLCByYXdFbmRQb3NpdGlvbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdXBkYXRlQ3Vyc29yO1xuIl19