---
date: 2022-10-31
type: 'page'
---

# Station Command Methods

Station Command Center is accessible via the URL `/stationcommand`.

The list of methods below represents changes and additions to the methods that all [Modules](/api/Modules) share.

## view ( session_id, building_id )

Command extends the view method to include a `planet` section.

```json
    {
       "building" : { /* ... */ },
       "status" : { /* ... */ },
       "next_colony_cost" : 750000, // the amount of happiness required to settle your next colony
       "planet" : {
           "id" : "id-goes-here",
           "x" : -4,
           "y" : 10,
           "z" : 6,
           "star_id" : "id-goes-here",
           "orbit" : 3,
           "type" : "habitable planet",
           "name" : "Earth",
           "image" : "p13",
           "size" : 67,
           "water" : 900,
           "ore" : {
               "gold" : 3399,
               "bauxite" : 4000,
               /* ... */
           },
           "building_count" : 7,
           "population" : 470000,
           "happiness" : 3939,
           "happiness_hour" : 25,
           "food_stored" : 33329,
           "food_capacity" : 40000,
           "food_hour" : 229,
           "energy_stored" : 39931,
           "energy_capacity" : 43000,
           "energy_hour" : 391,
           "ore_hour" 284,
           "ore_capacity" 35000,
           "ore_stored" 1901,
           "waste_hour" : 933,
           "waste_stored" : 9933,
           "waste_capacity" : 13000,
           "water_stored" : 9929,
           "water_hour" : 295,
           "water_capacity" : 51050
       }
    }
```

## view_plans ( session_id, building_id )

Returns a list of all the plans you've collected through various means.

```json
{
  "status": {
    /* ... */
  },
  "plans": [
    {
      "name": "Malcud Fungus Farm",
      "level": 1,
      "extra_build_level": 5
    }
    /* ... */
  ]
}
```

If the `level` is 1, and there is an `extra_build_level`, that means that the building will be built up to 1 plus the extra build level when complete. So in the example above, it would be a level 6 directly after being built.

### session_id

A session id.

### building_id

The unique id of the PCC.

## view_incoming_supply_chains ( session_id, building_id )

Returns a list of all incoming supply chains feeding this planet.

```json
{
  "status": {
    /* ... */
  },
  "supply_chains": [
    {
      "id": "id-goes-here",
      "from_body": {
        "id": "id-goes-here",
        "name": "Mars",
        "x": 0,
        "y": -123,
        "image": "station"
      },
      "resource_hour": 10000000,
      "resource_type": "water",
      "percent_transferred": 95,
      "stalled": 0
    }
    /* ... */
  ]
}
```

### session_id

A session id.

### building_id

The unique id of the PCC.

```

```
