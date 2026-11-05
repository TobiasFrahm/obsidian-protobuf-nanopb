# Protobuf & Nanopb Highlighting

Dieses Dokument in Obsidian öffnen, nachdem das Plugin aktiviert wurde.

```proto
syntax = "proto2";
package sensor;

import "nanopb.proto";
option (nanopb_fileopt).max_size = 64;

// Messwerte für ein Embedded-Gerät
message Telemetry {
  required uint32 timestamp = 1;
  optional string device_name = 2 [(nanopb).max_length = 32];
  repeated float readings = 3 [(nanopb).max_count = 8];
  optional bytes payload = 4 [(nanopb).max_size = 64];

  enum State {
    UNKNOWN = 0;
    READY = 1;
  }
  optional State state = 5 [default = UNKNOWN];
}
```

```protobuf
syntax = "proto3";
message Request {
  map<string, int32> values = 1;
  oneof selector {
    string name = 2;
    uint64 id = 3;
  }
}
service Sensor {
  rpc Read(Request) returns (stream Request);
}
```

```nanopb-options
# Separate .options-Datei
sensor.Telemetry.device_name max_length:32
sensor.Telemetry.readings max_count:8 fixed_count:true
sensor.Telemetry.* type:FT_STATIC
```

```nanopb
/* Nanopb-Optionen direkt in einer .proto-Datei */
message Packet {
  option (nanopb_msgopt).packed_struct = true;
  optional bytes data = 1 [(nanopb).max_size = 128];
}
```
