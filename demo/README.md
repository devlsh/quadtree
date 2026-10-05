<p align="center">
  <h1 align="center">@devlsh/quadtree-demo</h1>
  <p align="center">Visual demonstration of quadtree logic.</p>
</p>

<br />

The demo shows rectangular entities move and bounce around the world, with boxes showing each quad being generated.

Moving your mouse over the world shows both which quad matches the mouse position, and highlights all matching candidate entities.

These candidates are possible matches, not confirmed collisions. A highlighted entity does not necessarily touch the pointer. The demo does not perform exact collision detection, just showcases the spatial querying.

## Try It

Open the [interactive demo](https://quadtree.devlsh.com).

Move the pointer over the canvas to see the query results.

Use the controls to change the demonstration:

- **Simulation:** Clear `Playing` to pause movement. Adjust `Speed` to change movement speed. Adjust `Entities` to change the entity count.
- **Quadtree:** Adjust `Max Objects` or `Max Depth` to change subdivision.
- **World:** Adjust `Width` or `Height` to change the world dimensions.
- **Respawn:** Select this button to reset entity positions.

Controls and pointer queries also work while movement is paused.

---

> [devlsh.com](https://devlsh.com) &nbsp;&middot;&nbsp;
> GitHub: [@devlsh](https://github.com/devlsh) &nbsp;&middot;&nbsp;
> X: [@itsdevlsh](https://x.com/itsdevlsh)
