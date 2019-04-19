Introduction
============
I've been disappointed with a lot of modern 4x game offerings.  Those that aren't are overcomplicated and cluttered (Stellaris and Endless Space 2) are overly simplistic Master of Orion clones.  The goal of this project was to go in a different direction.  The plan was to make a minimalist cross platform 4x game using React to generate SVG on web and React Native.  Currently this project contains only the code to generate and render the galaxy.


Goals
=====
1) Stars should not be placed densely together, each needs to be tappable from a touch screen.
2) Two star lanes should never form too small of an angle with each other as this is hard to view and tap.  
3) Some stars should be strategically significant chokepoints for turtling.
4) The generator should avoid orphan stars that are only connected to a single other star.

Algorithm
=========
The generator works like this:
1) Place a star randomly
2) Check if the star is near an existing star.  If it is, remove it and return to step 1.
3) Continue until the maximum number of stars is generated.
4) Compute the Delaunay triangulation for all the stars (uses the excellent Delaunator library). 
5) Starting from the longest star lanes (graph edges), remove, checking that the map is still valid.
6) For all star lanes that form acute angles with other star lanes, remove the longer lane, checking that the map is still valid
7) Finally for all stars with large numbers of lanes, remove lanes until they have the preferred number of connections, each time checking that the map is still valid
8) Generate a voronoi diagram from the stars for influence maps

Next Steps
==========
[] Fill in large empty spaces between stars with Nebulas

[] Give stars fun names and generate planets for them

[] Render for React Native

[] Hide star names on zoom out

[] Show more star details on zoom in