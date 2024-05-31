## Workspace SPA Enhancements

### Summary

1. **Added Demo Square**:
   - A demo square was added to the SVG workspace for interactive manipulation.

2. **Custom Events**:
   - Implemented custom 'grab' and 'release' events based on the distance between two touch points.

3. **Event Listeners**:
   - Added listeners for the 'grab' event to check if the demo square is overlapping the touch points and set its state to 'grabbed'.
   - Added listeners for the 'release' event to unset the state attribute of all elements that are grabbed.

4. **Touch Event Handling**:
   - Tracked and updated temporary variables (scale, rotation, and coordinate offset) during multi-touch events.
   - Fired 'grab' event when the distance between two touch points becomes less than two-thirds of the initial distance, and 'release' event when they are further apart.
   - Applied the temporary offset to reposition grabbed elements, giving the behavior of a grab and move.