<?php

namespace App\Providers;

use App\Models\Setting;
use App\Queue\HostingerCompatibleWorker;
use App\Services\Courier\CourierServiceInterface;
use App\Services\Courier\NullCourierService;
use App\Services\Courier\PathaoCourierService;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Database\DatabaseManager;
use Illuminate\Log\LogManager;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Facade;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(CourierServiceInterface::class, fn ($app) => match (Setting::get('courier_default_provider')) {
            'pathao' => $app->make(PathaoCourierService::class),
            default => $app->make(NullCourierService::class),
        });

        $this->registerHostingerCompatibleQueueWorker();
    }

    /**
     * Replaces the 'queue.worker' singleton with App\Queue\HostingerCompatibleWorker
     * instead of the base Illuminate\Queue\Worker - see that class for why.
     *
     * Illuminate\Queue\QueueServiceProvider is a deferred provider, only
     * registered lazily on the *first* resolution of one of its provided
     * services ('queue.worker' among them) - whenever that happens, it
     * would clobber a plain singleton() override registered here, since
     * its own register() call runs after this one regardless of
     * bootstrap.providers.php order. extend() sidesteps that: it hooks
     * whatever resolves the service, however that happens, rather than
     * racing to register first.
     *
     * The closure body otherwise duplicates
     * QueueServiceProvider::registerWorker()'s (there's no Laravel API to
     * swap just the Worker subclass it constructs) - if a future Laravel
     * upgrade changes that closure, this should be updated to match.
     */
    protected function registerHostingerCompatibleQueueWorker(): void
    {
        $this->app->extend('queue.worker', function ($worker, $app) {
            $isDownForMaintenance = fn () => $this->app->isDownForMaintenance();

            $resetScope = function () use ($app): void {
                $log = $app->make(LogManager::class);
                $log->flushSharedContext();
                $log->withoutContext();

                foreach ($app->make(DatabaseManager::class)->getConnections() as $connection) {
                    $connection->resetTotalQueryDuration();
                    $connection->allowQueryDurationHandlersToRunAgain();
                }

                $app->forgetScopedInstances();

                Facade::clearResolvedInstances();

                memory_reset_peak_usage();
            };

            return new HostingerCompatibleWorker(
                $app['queue'],
                $app['events'],
                $app[ExceptionHandler::class],
                $isDownForMaintenance,
                $resetScope,
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
