import asyncHandler from 'express-async-handler'

import { prisma } from '../../prisma.js'
import { calculateMinute } from '../calculate-minute.js'

// @desc    Get workout log
// @route   GET /api/workouts/log/:id
// @access  Private
export const getWorkoutLog = asyncHandler(async (req, res) => {
	const workoutLog = await prisma.workoutLog.findUnique({
		where: {
			id: +req.params.id
		},
		include: {
			workout: {
				include: {
					exercises: true
				}
			},
			exerciseLogs: {
				orderBy: {
					id: 'asc'
				},
				include: {
					exercise: true
				}
			}
		}
	})

	if (!workoutLog) {
		if (!+req.params.id === 1) {
			res.status(404)
			throw new Error('Workout Log not found!')
		}
		return res.json({ isAnyLogsExisted: false })
	}

	res.json({
		isAnyLogsExisted: true,
		...workoutLog,
		minute: calculateMinute(workoutLog.workout.exercises.length)
	})
})
