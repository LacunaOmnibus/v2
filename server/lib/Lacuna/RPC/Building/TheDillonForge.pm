package Lacuna::RPC::Building::TheDillonForge;

use Moose;
use utf8;
use List::Util qw(min max);

no warnings qw(uninitialized);
extends 'Lacuna::RPC::Building';

sub app_url {
    return '/thedillonforge';
}

sub model_class {
    return 'Lacuna::DB::Result::Building::Permanent::TheDillonForge';
}

around 'view' => sub {
    my ($orig, $self, %args) = @_;
    my $session  = $self->get_session({session_id => $args{session_id}, building_id => $args{building_id}, skip_offline => 1 });
    my $empire   = $session->current_empire;
    my $building = $session->current_building;
    my $out = $orig->($self, (%args));
    if ($building->is_working) {
        my $work = $building->work;
        my $plan_class = $work->{class};
        my $desc;
        if ($work->{task} eq 'split_plan') {
            if ($work->{quantity} > 1) {
                $desc = sprintf("Splitting %d %s %s+%s", $work->{quantity}, $plan_class->name, $work->{level},$work->{extra_build_level}),
            }
            else {
                $desc = sprintf("Splitting %s %s+%s", $plan_class->name, $work->{level},$work->{extra_build_level}),
            }
        }
        elsif ($work->{task} eq 'make_plan') {
            $desc = sprintf("Making %s %s", $plan_class->name, $work->{level}),
        }
        else {
            $desc = "Error!";
        }
        $out->{tasks} = {
            seconds_remaining  => $building->work_seconds_remaining,
            can                => 0,
            working            => $desc,
        };
    }
    else {
        $out->{tasks} = $self->_forge_tasks($building);
    }
    $out->{tasks}{subsidy_cost} = $building->subsidy_cost;
    return $out;
};

# A number which represents how many Halls of Vrbansk it would take to build the plan
sub equivalent_halls {
    my ($self, $plan) = @_;

    my $arg_k   = int($plan->extra_build_level / 2 + 0.5);
    my $arg_l   = $plan->level * 2 + $plan->extra_build_level;
    my $arg_m   = ($plan->extra_build_level % 2) ? 0 : $plan->level + $plan->extra_build_level / 2;
    my $halls   = $arg_k * $arg_l + $arg_m;

    return $halls;
}

sub _forge_tasks {
    my ($self, $building) = @_;

    my $building_level = $building->effective_level ? $building->effective_level : 1;
    my $body = $building->body;

    my @split_plans;
PLAN:
    for my $plan (@{$body->plan_cache}) {
        # cannot split platform plans
        next PLAN if $plan->class =~ /Platform$/;
        # Can only split plans with recipes
        my $glyphs = Lacuna::DB::Result::Plan->get_glyph_recipe($plan->class);
        next PLAN if not $glyphs;

        my ($class) = $plan->class =~ m/Lacuna::DB::Result::Building::(.*)$/;

        my $halls = $self->equivalent_halls($plan);

        my $num_glyphs = scalar @$glyphs;

        push @split_plans, {
            name                => $plan->class->name,
            class               => $class,
            level               => $plan->level,
            extra_build_level   => $plan->extra_build_level,
            quantity            => $plan->quantity,
            fail_chance         => 100 - ($building_level * 3),
            reset_seconds       => int(($num_glyphs * $halls * 30 * 3600) / ($building_level * 4)),
        };
    }

    my @plans = grep {$_->level == 1 and $_->extra_build_level == 0} @{$body->plan_cache};

    my @make_plans;
    foreach my $plan (@plans) {
        # It takes 2 level 1 plans for each level we are constructing.
        my $max_level = min(int($plan->quantity / 2), $building_level);
        if ($max_level >= 2) {
            my ($class) = $plan->class =~ m/Lacuna::DB::Result::Building::(.*)$/;
            push @make_plans, {
                name                => $plan->class->name,
                max_level           => $max_level,
                class               => $class,
                reset_sec_per_level => 5000,
            };
        }
    }

    return {
        can         => 1,
        make_plan   => \@make_plans,
        split_plan  => \@split_plans,
    };
}

sub split_plan {
    my ($self, $session_id, $building_id, $plan_class, $level, $extra_build_level, $quantity) = @_;
    my $session  = $self->get_session({session_id => $session_id, building_id => $building_id });
    my $empire   = $session->current_empire;
    my $building = $session->current_building;
    $quantity = $quantity || 1;

    $building->split_plan($plan_class, $level, $extra_build_level, $quantity);

    return $self->view($session, $building);
}

sub make_plan {
    my ($self, $session_id, $building_id, $plan_class, $level) = @_;
    my $session  = $self->get_session({session_id => $session_id, building_id => $building_id });
    my $empire   = $session->current_empire;
    my $building = $session->current_building;

    $building->make_plan($plan_class, $level);

    return $self->view($session, $building);
}

sub subsidize {
    my ($self, $session_id, $building_id) = @_;
    my $session  = $self->get_session({session_id => $session_id, building_id => $building_id });
    my $empire   = $session->current_empire;
    my $building = $session->current_building;

    unless ($building->is_working) {
        confess [1010, "Nothing is being done!"];
    }

    my $subsidy_cost = $building->subsidy_cost;

    unless ($empire->essentia >= $subsidy_cost) {
        confess [1011, "Not enough essentia."];
    }

    $building->finish_work->update;
    $empire->spend_essentia({
        amount  => $subsidy_cost,
        reason  => 'Dillon Forge subsidy after the fact',
    });
    $empire->update;

    return $self->view($session, $building);
}

__PACKAGE__->register_rpc_method_names(qw(split_plan make_plan subsidize));

no Moose;
__PACKAGE__->meta->make_immutable;
1;
