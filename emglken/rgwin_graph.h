/* gtw_graph.h: The graphics window header
        for RemGlk, remote-procedure-call implementation of the Glk API.
    Designed by Andrew Plotkin <erkyrath@eblong.com>
    http://eblong.com/zarf/glk/
*/

typedef struct window_graphics_struct {
    window_t *owner;
    
    int graphwidth, graphheight;
} window_graphics_t;

extern window_graphics_t *win_graphics_create(window_t *win);
extern void win_graphics_destroy(window_graphics_t *dwin);

extern void win_graphics_trim_buffer(window_t *win);
