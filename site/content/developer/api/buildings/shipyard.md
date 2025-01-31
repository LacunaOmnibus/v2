---
date: 2022-10-31
type: 'page'
---

# Ship Descriptions

Ship descriptions are bulky, and are the same every time. As such we've created a file you can download
to include ship descriptions in your client. You should cache this file once you've downloaded and only
get it again if it has changed.

    https://servername.lacunaexpanse.com/resources.json

# Fleets

Ships with the same attributes are now grouped into a 'Fleet' which can be handled as a single unit, for
example you can send a fleet of ships to another planet. If you specify a smaller number of ships than
there are in the fleet, then this forms two fleets, one part of the fleet stays home, the other goes to the
planet. When fleets with the same attribute gather, they automatically form a single larger fleet.

# Shipyard Methods

Shipyard is accessible via the URL `/shipyard`.

The shipyard is where you construct ships. However, there are pre-requisites, such as other buildings or university
level for certain ships. The higher the level of the shipyard, the faster your ships will be built.

The list of methods below represents changes and additions to the methods that all [Buildings](/api/Buildings) share.

## view_build_queue

View all fleets currently under construction at this shipyard.

Accepts either fixed arguments or a hash of named parameters

    ( session_id, building_id, page_number )
    ( parameter_hash )

### session_id (required)

A session ID

### building_id (required)

This buildings ID

### page_number (optional)

The page number of the results

### items_per_page (optional)

hOW many items per page. Defaults to 25

### no_paging (optional)

If set to 1, it over-rides items_per_page and page_number and returns all results. Defaults to 0.

### RESPONSE

```json
    {
      "status" : { /* ... */ },
      "number_of_fleets" : 10,
      "cost_to_subsidize" :  30,
      "fleets" : [
        {
          "id" :             "1234",
          "task" :           "Building",
          "type" :           "spy_pod",
          "type_human" :     "Spy Pod",
          "date_completed" : "01 31 2010 13:09:05 +0600",
          "quantity" :       "10"
        },
        {
          "id" :             "1245",
          "task" :           "Repairing",
          "type" :           "sweeper",
          "type_human" :     "Sweeper",
          "date_completed" : "01 31 2010 14:09:00 +0600",
          "quantity" :       "1"
        /* ... */
      ]
    }
```

The response gives the **number_of_fleets** that are either **Building** or **Repairing** and
the **cost_to_subsidize**, note that the
cost is based on the total number of ships being constructed or repaired, not the number of fleets.

**fleets** is an array of the fleets in the build queue sorted with the first fleet to
complete at the start of the list.

Note, no ships in a fleet will become available until all ships in the fleet have been completed.

Because of efficiency of scale, building a fleet of several ships is quicker than building the
same number of ships individually.

## subsidize_build_queue

Will spend 1 essentia per ship to complete the current build queue immediately.

Accepts either fixed arguments or a hash of named parameters

    ( session_id, building_id )
    ( parameter_hash )

### session_id (required)

A session ID

### building_id (required)

This buildings ID

### RESPONSE

Returns **view_build_queue**

Throws 1011.

## subsidize_fleet ( parameter_hash )

Will spend 1 essentia to complete the build of the specified ship.

This accepts a hash of named arguments.

```json
    {
      "session_id"    : 1234-123-123,
      "building_id"   : 4567,
      "fleet_id"      : 88478,
    }
```

Throws 1011.

### session_id (required)

A session id.

### building_id (required)

The unique id of the Shipyard.

### ship_id (required)

The unique id of the Ship, as returned in `view_build_queue`

### RESPONSE

Returns the same as `view_build_queue`

## get_buildable

Returns a list of ships that can be constructed and their costs, and if they're not buildable,
gives a reason why not.

Accepts either fixed arguments or a hash of named parameters

    ( session_id, building_id, [tag] )
    ( parameter_hash )

### session_id (required)

A session ID

### building_id (required)

This buildings ID

### tag (optional)

An optional tag to limit the list of available ships to something shorter. If no tag is specified,
then all ships will be displayed.

- Trade

  Ships that can be used to carry resources between colonies.

- Colonization

  Ships used to get more planets.

- Intelligence

  Ships that deal with spies or intelligence gathering.

- Exploration

  Ships that allow the user to go out and explore the Expanse.

- War

  Ships that are used to attack or defend.

- Mining

  Ships that are used to gather resources from space.

### RESPONSE

```json
{
  "buildable": {
    "probe": {
      "type_human": "Probe",
      "can": 1,
      "reason": null,
      "cost": {
        "seconds": 900,
        "food": 1100,
        "water": 1000,
        "energy": 1200,
        "ore": 1200,
        "waste": 100
      },
      "attributes": {
        "speed": 1000, // 100 roughly equals 1 star in 1 hour
        "hold_size": 1000,
        "max_occupants": 2,
        "combat": 0,
        "stealth": 1500,
        "berth_level": 5
      },
      "tags": ["Exploration", "Intelligence"]
    }
    /* ... */
  },
  "docks_available": 7,
  "status": {
    /* ... */
  }
}
```

The response gives a list of ships, whether they **can** be build or not, and if not, the **reason**
they cannot be built (an arrayref).

The **cost** represents the cost of producing one ship. **seconds** is the time it would take to produce one
ship, but due to efficiency of scale the cost reduces if you build a fleet of ships, the more ships in the
fleet, the quicker each one is built.

**docks_available** returns the number of remaining empty Spaceport docks available. You can't build more ships
that would fit in your docks.

**tags** represent attributes about ships that can be used to filter them. The list is.

- Trade
- Colonization
- SupplyChain
- WasteChain
- Intelligence
- Exploration
- War
- Mining

## get_repairable

Returns a list of ships that require repair. Any fleet that is involved in a battle may be
damaged. This is represented by a fractional quantity, e.g. **10.1** ships.

When the fleet returns to Dock, the fractional Ship is available to be repaired.

Accepts a hash of named parameters

    ( parameter_hash )

### session_id (required)

A session ID

### building_id (required)

This buildings ID

### RESPONSE

```json
{
  "repairable": [
    {
      "id": 1234,
      "type": "sweeper",
      "type_human": "Sweeper",
      "cost": {
        "seconds": 900,
        "food": 1100,
        "water": 1000,
        "energy": 1200,
        "ore": 1200,
        "waste": 100
      },
      "attributes": {
        "speed": 1000, // 100 roughly equals 1 star in 1 hour
        "hold_size": 0,
        "max_occupants": 0,
        "combat": 9000,
        "stealth": 1500,
        "berth_level": 1
      }
    }
    /* ... */
  ],
  "docks_available": 7, // you can only build ships up to the number of docks you have available
  "build_queue_max": 60, // maximum queueable ships
  "build_queue_used": 3, // ships in queue for all shipyards
  "status": {
    /* ... */
  }
}
```

This response gives a list of ships that require repair.

The **cost** represents the cost of repairing the ship. The repair cost will be based on a percentage of the
cost to produce a new ship. e.g. if there is only 0.1 of a ship, then it requires 90% of the cost of a new
ship to repair it.

**docks_available** returns the number of remaining empty Spaceport docks available. You can't build or
repair more ships than would fit in your docks.

## build_fleet

Build a fleet of ships.

Accepts either fixed arguments or a hash of named parameters

    ( session_id, building_id, type, quantity )
    ( parameter_hash )

### session_id (required)

A session_id ID

### building_id (required)

This buildings ID

### type (required)

The type of ship to build, as specified by the **get_buildable** call.

### quantity (optional)

The number of ships to build in the fleet. Defaults to 1.

You may specify any number of ships subject to the following:-

You must have that number of Shipyard construction slots available.

You must have that number of Space Port docks available.

You must have the resources available to build the specified quantity of ships.

Note that by constructing a fleet of multiple ships means that construction is more efficient due to the
economy of scale, so the total time to construct each ship in the fleet is reduced accordingly. The more
ships, the quicker each ship is built.

Also note that by constructing a fleet, none of the ships become available until all ships in the fleet
are completed.

### RESPONSE

Returns the same as **view_build_queue**.

## repair_fleet

Repair a ship in a fleet.

Accepts a hash of named parameters

    ( parameter_hash )

### session_id (required)

A session_id ID

### building_id (required)

This buildings ID

### fleet_id (required)

The ID of the fleet requiring repair.

### RESPONSE

Returns the same as **view_build_queue**.

Note that the single (fractional) ship that requires repair will be taken out of the fleet
during it's repair and returned to the fleet when the repair is complete.

```

```
