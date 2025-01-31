package Lacuna::Role::Trader;

use Moose::Role;
use feature "switch";
use Lacuna::Constants qw(ORE_TYPES FOOD_TYPES);
use Lacuna::Util qw(randint);
use Data::Dumper;

use experimental "switch";

# hopefully this constant allows the comparison later to be
# compiled out based on how we're called.
our $overload_allowed;
use constant OVERLOAD_ALLOWED => $overload_allowed;

  my $have_exception = [1011, 'You cannot offer to trade something you do not have.'];
  my $cargo_exception = 'You need %s cargo space to trade that.';
  my $offer_nothing_exception = [1013, 'It appears that you have offered nothing.'];
  my $ask_nothing_exception = [1013, 'It appears that you have asked for nothing.'];
  my $fractional_offer_exception = [1013, 'You cannot offer a fraction of something.'];

sub _market {
    my $self = shift;
    return Lacuna->db->resultset('Market');
}

sub market {
    my $self = shift;
    return $self->_market->search({max_university => [ undef, { '>=', $self->body->empire->university_level } ]});
}

sub my_market {
  my $self = shift;
  return $self->_market->search({body_id => $self->body_id, transfer_type => $self->transfer_type});
}

sub check_payload {
  my ($self, $items, $available_cargo_space, $space_exception, $transfer_ship) = @_;
  my $body = $self->body;
  $space_exception ||= $cargo_exception;

  # validate
  unless (ref $items eq 'ARRAY') {
    confess [ 9999, 'The list of items you want to trade needs to be formatted as an array of hashes.'];
  }

  my $space_used;
  my @expanded_items;

  foreach my $item (@{$items}) {
    given($item->{type}) {
      when ([qw(water energy waste), ORE_TYPES, FOOD_TYPES]) {
        confess $offer_nothing_exception unless ($item->{quantity} > 0);
        confess $fractional_offer_exception if ($item->{quantity} != int($item->{quantity}));
        confess $have_exception unless ($body->get_stored($item->{type}) >= $item->{quantity});
        push @expanded_items, $item;
        $space_used += $item->{quantity};
      }
      when ('glyph') {
        confess $offer_nothing_exception unless ($item->{quantity} > 0);
        confess $fractional_offer_exception if ($item->{quantity} != int($item->{quantity}));
        confess [1002, 'you must specify a glyph name with a quantity.'] unless $item->{name};
        my $glyph = Lacuna->db->resultset('Glyph')->search({
            type    => $item->{name},
            body_id => $self->body_id,
            })->first;
        my $gquant = 0;
        if (defined $glyph) {
            $gquant = $glyph->quantity;
        }
        confess [1002, "You don't have ".$item->{quantity}." glyphs of type ".
                        $item->{name}." you only have ".$gquant]
                      unless $gquant >= $item->{quantity};
        push @expanded_items, $item;
        $space_used += 100 * $item->{quantity};
      }
            when ('plan') {
                if ($item->{plan_id}) {
                    confess [1002, 'Plan IDs are no longer supported'];
                }
                elsif ($item->{quantity}) {
                    confess $offer_nothing_exception unless ($item->{quantity} > 0);
                    confess $fractional_offer_exception if ($item->{quantity} != int($item->{quantity}));
                    confess [1002, 'you must specify a plan_type if you specify a quantity.'] unless $item->{plan_type};
                    confess [1002, 'you must specify a level if you specify a quantity.'] unless $item->{level};
                    confess [1002, 'you must specify an extra_build_level if you specify a quantity.'] unless defined $item->{extra_build_level};

                    my $plan_class = $item->{plan_type};
                    $plan_class =~ s/_/::/g;
                    $plan_class = "Lacuna::DB::Result::Building::$plan_class" unless $plan_class =~ /^Lacuna::DB::Result::Building::/;
                    my ($plan) = grep {
                            $_->class eq $plan_class
                        and $_->level == $item->{level}
                        and $_->extra_build_level == $item->{extra_build_level}
                        } @{$body->plan_cache};
                    confess [1002, "You don't have ".$item->{quantity}." plans of type ".$item->{plan_type}] unless defined $plan and $plan->quantity >= $item->{quantity};

                    push @expanded_items, {type => 'plan', plan_id => $plan->id, quantity => $item->{quantity} };
                    $space_used += 1000 * $item->{quantity};
                }
                else {
                    confess [1002, 'You must specify a quantity if you are pushing a plan.'];
                }
            }
      when ('prisoner') {
        confess [1002, 'You must specify a prisoner_id if you are pushing a prisoner.'] unless $item->{prisoner_id};
        my $prisoner = Lacuna->db->resultset('Spy')->find($item->{prisoner_id});
        confess $have_exception unless (defined $prisoner && $self->body_id eq $prisoner->on_body_id && $prisoner->task eq 'Captured');
        push @expanded_items, $item;
        $space_used += 350;
      }
      when ('fleet') {
        if ($item->{fleet_id}) {
          my $fleet = Lacuna->db->resultset('Fleet')->find($item->{fleet_id});
          confess $have_exception unless (defined $fleet && $self->body_id eq $fleet->body_id && $fleet->task eq 'Docked');
          my $quantity = $item->{quantity} || $fleet->quantity;
          confess [1002, "You don't have ".$quantity." ships in your fleet of type ".$fleet->type_human] unless $fleet->quantity >= $quantity;
          push @expanded_items, $item;
          # TODO: do we need to check if the fleet sending the trade is NOT part of the cargo?
          $space_used += 50000 * $quantity;
        }
        else {
          confess [1002, 'You must specify a fleet_id or a quantity if you are pushing a fleet.'];
        }
      }
    }
  }
  $items = \@expanded_items;
  confess $offer_nothing_exception unless $space_used;
  confess [1011, sprintf($space_exception,$space_used)] unless (OVERLOAD_ALLOWED or $space_used <= $available_cargo_space);
  return $space_used, $items;
}

sub structure_payload {
    my ($self, $items, $space_used) = @_;
    my $body = $self->body;
    my $payload;
    my %meta = ( offer_cargo_space_needed => $space_used );
    foreach my $item (@{$items}) {
        given($item->{type}) {
            when ([qw(water energy waste)]) {
                $body->spend_type($item->{type}, $item->{quantity});
                $body->update;
                $payload->{resources}{$item->{type}} += $item->{quantity};
                $meta{'has_'.$item->{type}} = 1;
            }
            when ([ORE_TYPES]) {
                $body->spend_type($item->{type}, $item->{quantity});
                $body->update;
                $payload->{resources}{$item->{type}} += $item->{quantity};
                $meta{has_ore} = 1;
            }
            when ([FOOD_TYPES]) {
                $body->spend_type($item->{type}, $item->{quantity});
                $body->update;
                $payload->{resources}{$item->{type}} += $item->{quantity};
                $meta{has_food} = 1;
            }
            when ('glyph') {
                if ($item->{name}) {
                    my $num_used = $body->use_glyph($item->{name}, $item->{quantity});
                    if ($num_used) {
                        push @{$payload->{glyphs}}, {
                            name     => $item->{name},
                            quantity => $num_used,
                        };
                        $meta{has_glyph} = 1;
                    }
                }
            }
            when ('plan') {
                if ($item->{plan_id}) {
                    my ($plan) = grep {$_->id == $item->{plan_id}} @{$body->plan_cache};

                    $body->delete_many_plans($plan, $item->{quantity});
                    push @{$payload->{plans}}, {
                        class               => $plan->class,
                        level               => $plan->level,
                        extra_build_level   => $plan->extra_build_level,
                        quantity            => $item->{quantity},
                        };
                    $meta{has_plan} = 1;
                }
            }
            when ('prisoner') {
                my $prisoner = Lacuna->db->resultset('Spy')->find($item->{prisoner_id});
                $prisoner->task('Prisoner Transport');
                $prisoner->update;
                push @{$payload->{prisoners}}, $prisoner->id;
                $meta{has_prisoner} = 1;
            }
            when ('fleet') {
                if ($item->{fleet_id}) {
                    my $fleet = Lacuna->db->resultset('Fleet')->find($item->{fleet_id});
                    $fleet->task('Waiting On Trade');
                    $fleet->update;
                    push @{$payload->{fleets}}, $fleet->id;
                    $meta{has_fleet} = 1;
                }
            }
        }
    }
    return ($payload, \%meta);
}


1;
