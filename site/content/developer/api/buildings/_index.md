---
date: 2022-10-31
type: 'page'
title: 'Buildings Overview'
---

# Building Descriptions

Your app can download a copy of the building descriptions from `http://servername.lacunaexpanse.com/resources.json`. Your app should cache this file, and only download a new copy if it has changed. We do not include this information in ["get_buildings" in Body](/api/Body#get_buildings) because it's the same on every request for every empire and would add a lot of bandwidth for nothing.

# Building Methods

All buildings have some methods in common. This is a description of the methods available from each building.

**NOTE:** To use these methods, you must use the URL of the individual building types.
You can find the list of building types at the bottom of this page.

## build

Adds this building to the planet's build queue.

Accepts either fixed arguments or a hash of named parameters

    ( session_id, planet_id, x, y )
    ( parameter_hash )

Throws 1002, 1010, 1011, and 1012, and 1013.

### session_id

A session id.

### planet_id

The id of the planet you wish to build on.

### x

The x axis of the area on the planet you wish to place the building. Valid values are between -5 and 5 inclusive.

### y

The y axis of the area on the planet you wish to place the building. Valid values are between -5 and 5 inclusive.

### RESPONSE

```json
    {
      "building" : {
        "id" : "id-goes-here",
        "pending_build" : {
          "seconds_remaining" : 430,
          "start" : "01 31 2010 13:09:05 +0600",
          "end" : "01 31 2010 18:09:05 +0600"
        },
        "level" : 0,
      "status" : { /* ... */ }
    }
```

## view

Retrieves the propertios of the building

Accepts either fixed arguments or a hash of named parameters

    ( session_id, building_id )
    ( parameter_hash )

Throws 1002 and 1010.

### session_id

A session id.

### building_id

The id of the building.

### RESPONSE

```json
    {
      "building" : {
        "id" : "id-goes-here",
        "name" : "Planetary Command",
        "image" : "command6",
        "level" : 6,
        "x" : 0,
        "y", 0,
        "food_hour" : 500,
        "food_capacity" : 500,
        "energy_hour" : -44,
        "energy_capacity" : 500,
        "ore_hour" : -310,
        "ore_capacity" : 500,
        "water_hour" : -100,
        "water_capacity" : 500,
        "waste_hour" : 33,
        "waste_capacity" : 500,
        "happiness_hour" : 0,
        "efficiency" : 100,
        "repair_costs" : {
          "food" : 0,
          "water" : 0,
          "energy" : 0,
          "ore" : 0
        },
        "pending_build" : {
          "seconds_remaining" : 430,
          "start" : "01 31 2010 13:09:05 +0600",
          "end" : "01 31 2010 18:09:05 +0600"
        },
        "work" : {
          "seconds_remaining" : 49,
          "start" : "01 31 2010 13:09:05 +0600",
          "end" : "01 31 2010 18:09:05 +0600"
        },
        "downgrade" : {
          "can" : 1,
          "reason" : "",
          "image" : "command5",
        },
        "upgrade" : {
          "can" : 0,
          "reason" : [1011, "Not enough resources.", "food"],
          "cost" : {
            "food" : 500,
            "water" : 500,
            "energy" : 500,
            "waste" : 500,
            "ore" : 1000,
            "time" : 1200,
          },
          "production" : {
            "food_hour" : 1500,
            "food_capacity" : 500,
            "energy_hour" : -144,
            "energy_capacity" : 500,
            "ore_hour" : -1310,
            "ore_capacity" : 500,
            "water_hour" : -1100,
            "water_capacity" : 500,
            "waste_hour" : 133,
            "waste_capacity" : 500,
            "happiness_hour" : 0,
          },
          "image" : "command7"
        }
      }
      "status" : { /* ... */ }
    }
```

**pending_build** is only returned when a building is building or upgrading.

**work** is only returned when a building is working (Parks, Waste Recycling etc).

## upgrade

Adds the requested upgrade to the build queue.

Accepts either fixed arguments or a hash of named parameters

    ( session_id, building_id )
    ( parameter_hash )

Throws 1002, 1010, 1011, and 1012, and 1013.

### session_id

A session id.

### building_id

The id of the building you wish to retrieve.

### RESPONSE

```json
    {
      "building" : {
        "id" : "id-goes-here",
        "pending_build" : {
          "seconds_remaining" : 430,
          "start" : "01 31 2010 13:09:05 +0600",
          "end" : "01 31 2010 18:09:05 +0600"
        },
        "level" : 1
      }
      "status" : { /* ... */ }
    }
```

## demolish

Allows you to instantly destroy a building.

Accepts either fixed arguments or a hash of named parameters

    ( session_id, building_id )
    ( parameter_hash )

Throws 1012.

### session_id

A session id.

### building_id

The id of the building you wish to demolish.

### RESPONSE

```json
{
  "status": {
    /* ... */
  }
}
```

**SPECIAL EXCEPTION:** If the user downgrades a level 1 building, then the Client needs to eliminate that
object from the user's view. This method will return the view of the level 1 building, because that's
it's intended course of action, but the client needs to handle this gracefully for the user.

## downgrade ( session_id, building_id )

Downgrades a building by one level.

Accepts either fixed arguments or a hash of named parameters

    ( session_id, building_id )
    ( parameter_hash )

Throws 1012.

### session_id

A session id.

### building_id

The id of the building you wish to demolish.

### RESPONSE

Returns the same as `view`

## get_stats_for_level ( session_id, building_id, level )

This method is for power users and script writers. It will return the projected stats of a building
at a certain level. The building must already exist on the planet, because where it exists and who
it is owned by affects the stats of the building.

Accepts either fixed arguments or a hash of named parameters

    ( session_id, building_id, level )
    ( parameter_hash )

Throws 1009.

### session_id

A session id.

### building_id

The id of the building you wish to get stats for.

### level

The level that you want stats of the building for, between 1 and 30

### RESPONSE

```json
    {
      "building" : {
        "id" : "id-goes-here",
        "name" : "Planetary Command",
        "image" : "command6",
        "level" : 6,
        "food_hour" : 500,
        "food_capacity" : 500,
        "energy_hour" : -44,
        "energy_capacity" : 500,
        "ore_hour" : -310,
        "ore_capacity" : 500,
        "water_hour" : -100,
        "water_capacity" : 500,
        "waste_hour" : 33,
        "waste_capacity" : 500,
        "happiness_hour" : 0,
        "upgrade" : {
          "cost" : {
            "food" : 500,
            "water" : 500,
            "energy" : 500,
            "waste" : 500,
            "ore" : 1000,
            "time" : 1200,
          },
          "production" : {
            "food_hour" : 1500,
            "food_capacity" : 500,
            "energy_hour" : -144,
            "energy_capacity" : 500,
            "ore_hour" : -1310,
            "ore_capacity" : 500,
            "water_hour" : -1100,
            "water_capacity" : 500,
            "waste_hour" : 133,
            "waste_capacity" : 500,
            "happiness_hour" : 0,
          },
          "image" : "command7"
        }
      }
      "status" : { /* ... */ }
    }
```

## repair

Restores a building's efficiency to 100%. See the `repair_costs` section of the `view` method to see how
many resources will be spent in this process.

Accepts either fixed arguments or a hash of named parameters

    ( session_id, building_id )
    ( parameter_hash )

Throws 1009.

### session_id

A session id.

### building_id

The id of the building you wish to get stats for.

### RESPONSE

Returns **view**

# Space Station Modules

Space stations have buildings too (called Modules), but they don't behave exactly the same as ground
based buildings. See the [Modules](/api/modules) documentation for more information.

# Building Types

Below is a list of the different types of structures that can be built on planets in Lacuna. They all
share the above methods, but many have additional methods available.
