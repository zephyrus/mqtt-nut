# mqtt-nut
MQTT integration for Network UPS Tools (NUT)

## Docker Compose

```yml
version: '3'

services:

  nut:
    image: 2mqtt/nut:0.0.3

    restart: always

    environment:
      - MQTT_ID=nut
      - MQTT_PATH=nut
      - MQTT_HOST=mqtt://<ip address of mqtt broker>
      - MQTT_USERNAME=<mqtt username>
      - MQTT_PASSWORD=<mqtt password>
      - NUT_HOST=<ip address of nut server>
      - NUT_USERNAME=<nut username>
      - NUT_PASSWORD=<nut password>
```