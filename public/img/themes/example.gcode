; Example G-code for testing in MainsailOS UI

; Start by homing all axes
G28 ; Home all axes

; Move to a safe height
G1 Z10 F3000 ; Move Z axis up to 10mm at 3000mm/min

; Move to the front-left corner
G1 X0 Y0 F5000 ; Move to X0 Y0 at 5000mm/min

; Draw a square pattern
G1 X100 Y0 F3000 ; Move to X100 Y0
G1 X100 Y100 ; Move to X100 Y100
G1 X0 Y100 ; Move to X0 Y100
G1 X0 Y0 ; Return to X0 Y0

; Return to center
G1 X50 Y50 F3000 ; Move to X50 Y50

; Finish
M84 ; Disable motors