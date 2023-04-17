import asyncHandler from 'express-async-handler'

import { prisma } from '../../prisma.js'

// @desc    Create new workout log
// @route   POST /api/workouts/log/:id
// @access  Private

export const createInitialWorkoutLog = async (workoutId, userId) => {
	const workout = await prisma.workout.findUnique({
		where: {
			id: workoutId
		},

		include: {
			exercises: true
		}
	})

	if (!workout) {
		return null
	}

	const workoutLog = await prisma.workoutLog.create({
		data: {
			user: {
				connect: {
					id: userId
				}
			},
			workout: {
				connect: {
					id: workoutId
				}
			},
			exerciseLogs: {
				create: workout.exercises.map(exercise => ({
					user: {
						connect: {
							id: userId
						}
					},
					exercise: {
						connect: {
							id: exercise.id
						}
					},
					times: {
						create: Array.from({ length: exercise.times }, () => ({
							weight: 0,
							repeat: 0
						}))
					}
				}))
			}
		},
		include: {
			exerciseLogs: {
				include: {
					times: true
				}
			}
		}
	})

	return workoutLog
}

export const createNewWorkoutLog = asyncHandler(async (req, res) => {
	const workoutId = +req.params.id
	const userId = req.user.id

	const workoutLog = createInitialWorkoutLog(workoutId, userId)

	if (!workoutLog) {
		res.status(404)
		throw new Error('Workout not found!')
	}

	res.json(workoutLog)
})
