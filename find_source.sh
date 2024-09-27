ECHO_SOURCE=$(pactl list sources short | grep 'input' | grep 'echo-cancel' | awk '{print $2}')

pactl set-default-source "$ECHO_SOURCE"
